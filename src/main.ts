import { components } from '@octokit/openapi-types'
import { GitHubEvent, GitHubEventOfType, GitHubEventType } from './github-types'
import { Verb, knownVerbs } from './grammar'

import fs from 'fs'
import path from 'path';

const BASE_USER: string | string[] = 'ninjack-dev';
/** Truncate username from repository name, e.g. octocat/Hello-World -> Hello-World */
let TRUNCATE_USERNAME: 'user' | 'all' | 'none' = 'user';
let MAX_PATH_LENGTH: number = 10
let API_RESOURCE_PATH = "./test/08-03/"
/** 
 * Substitute a repository regular expression for a custom name.
 *
 * ```ts
 *   [/octocat\/(.*)/, (m) => `my ${m[1]}`]
 * ```
 *
 * */
let REPO_NAME_SUBSTITUTIONS: [RegExp, ((m: RegExpExecArray) => string) | string][] = [
  [/ninjack-dev\/dotfiles/, 'my dotfiles'],
  [/ninjack-dev\/(.*)/, (m) => `my ${m[1]}`]
]

function ToPresentParticiple(base: Verb): string {
  if (base.endsWith('e')) {
    return base.slice(0, -1) + 'ing'; // e.g. 'update' → 'updating'
  }
  if (/[^aeioux][aeioux][^aeioux]$/.test(base)) {
    return base + base.slice(-1) + 'ing'; // double consonant: 'tag' → 'tagging', except for x
  }
  return base + 'ing';
}

function ExtractPresentParticiple(commitMessage: string): Verb | null {
  const baseVerb = knownVerbs[
    commitMessage.trim().split(/\s+/)
      .find((w): w is keyof typeof knownVerbs => w.toLowerCase() in knownVerbs)?.toLowerCase()
    ?? 'updating'
  ]
  return baseVerb
  // return ToPresentParticiple(baseVerb);
}

function BuildModifiedEventTypeString(event: GitHubEventOfType<"PushEvent">): string {
  switch (ExtractPresentParticiple(event.payload.commits[0].message)) {
    case "update":
    case "fix":
    case "revert":
    case "add":
    case "create":
    case "delete":
    case "remove":
    case "change":
    case "refactor":
    case "merge":
    case "rename":
    case "improve":
    case "optimize":
    case "enhance":
    case "validate":
    case "document":
    case "comment":
    case "format":
    case "configure":
    case "bump":
    case "lock":
    case "initialize":
    case "test":
    case "mock":
    case "cherry":
    case "squash":
    case "tag":
  }
}

function BuildPushEventString(event: GitHubEventOfType<'PushEvent'>): string {

  let ghcommit = event.payload.commits[0]

  /// TODO: REPLACE WITH AGNOSTIC METHOD
  let commit = JSON.parse(fs.readFileSync(API_RESOURCE_PATH + ghcommit.url, 'utf8')) as components['schemas']['commit']

  // https://git-scm.com/docs/git-status#_output
  // Files can have different statuses, reported by Git itself. We sort these files to find the most relevant one.
  let commitReferenceFile = commit.files?.sort((a, b) => {
    type GitFileStatus = NonNullable<components['schemas']['commit']['files']>[number]['status']
    const statusPriority: Record<GitFileStatus, number> = (Object.fromEntries(
      [
        'modified',
        'added',
        'removed',
        'renamed',
        'changed',
        'copied',
        'unchanged'
      ].map((status, idx) => [status, idx])) as Record<GitFileStatus, number>
    );
    const statusCompare = statusPriority[a.status] - statusPriority[b.status];
    if (statusCompare !== 0) return statusCompare;
    else return b.changes - a.changes; // Sort by number of line changes
  }).at(0);

  switch (commitReferenceFile?.status) {
    case 'modified': { return `Last seen working on ${commitReferenceFile.filename} in ${event.repo.name}` } // TODO: Replace with proper verb handling
    case 'added': { return `Last seen adding ${commitReferenceFile.filename} to ${event.repo.name}` }
    case 'removed': { return `Last seen removing ${commitReferenceFile.filename} from ${event.repo.name}`; }
    case 'renamed': { return `Last seen renaming ${commitReferenceFile.previous_filename} to ${commitReferenceFile.filename} in ${event.repo.name}`; }
    case 'changed': { return `last seen changing ${commitReferenceFile.filename} in ${event.repo.name}`; }
    case 'copied': { return `Last seen working on ${event.repo.name}`; } // Difficult to handle without knowing copyee name
    case 'unchanged': { return `Last seen working on ${event.repo.name}`; } // Maybe consider defaulting to another file? Same for above
  }

  return `Last seen ${ExtractPresentParticiple(ghcommit.message)} ${event.repo.name}`;
}

function UpdateRepoName(event: GitHubEvent): string {
  for (const [regex, value] of REPO_NAME_SUBSTITUTIONS) {
    const match = regex.exec(event.repo.name);
    if (match) {
      return typeof value === "function" ? value(match) : value;
    }
  }

  switch (TRUNCATE_USERNAME) {
    case 'user':
      return event.repo.name.split(/\//).at(0) === BASE_USER
        ? (event.repo.name.split(/\//).at(-1) ?? event.repo.name)
        : event.repo.name
    case 'all':
      return event.repo.name.split(/\//).at(-1) ?? event.repo.name
    case 'none':
      return event.repo.name
  }
}

let testEventList = JSON.parse(fs.readFileSync(API_RESOURCE_PATH + 'test_events.json', 'utf8')) as GitHubEvent[]

testEventList.forEach(event => {

  let repoDisplayName = UpdateRepoName(event);

  // TODO: Determine if adding extra info by following `event.repo.url` is worthwhile, or if building the URL string is enough
  switch (event.type) {
    case 'CommitCommentEvent': {
      console.log(`Last seen [commenting on a commit](${event.payload.comment.html_url}) in [${repoDisplayName}](https://github.com/${event.repo.name})`);
      break;
    }
    case 'CreateEvent': {
      console.log(`Last seen creating [${repoDisplayName}](https://github.com/${event.repo.name})`)
      break;
    }
    case 'DeleteEvent': {
      console.log(`Last seen deleting a repository`);
      break;
    }
    case 'ForkEvent': {
      console.log(`Last seen making a [fork](https://github.com/${repoDisplayName}) of [${event.payload.forkee.name}](${event.payload.forkee.html_url})`)
      break;
    }
    case 'GollumEvent': { break; }
    case 'IssueCommentEvent': {
      console.log(`Last seen commenting on [${event.payload.issue.number}](${event.payload.issue.html_url}) in [${repoDisplayName}](https://github.com/${event.repo.name})`);
      break;
    }
    case 'IssuesEvent': {
      let phrase = {
        opened: `opening [#${event.payload.issue.number}](${event.payload.issue.html_url})`,     // last seen opening #<number>
        edited: `edited [#${event.payload.issue.number}](${event.payload.issue.html_url})`,     // last seen editing #<number>
        closed: `closing [#${event.payload.issue.number}](${event.payload.issue.html_url})`,     // last seen closing #<number>
        reopened: `reopening [#${event.payload.issue.number}](${event.payload.issue.html_url})`, // last seen reopening #<number>
        assigned: event.payload.assignee
          ? `assigning [#${event.payload.issue.number}](${event.payload.issue.html_url}) to ${event.payload.assignee.name}` // last seen assigning #<number> to #<assignee>
          : null,
        unassigned: null, // REMOVE
        labeled: null, // REMOVE
        unlabeled: null // REMOVE
      }[event.payload.action] ?? `working on ${event.payload.issue.number}`;

      console.log(`Last seen ${phrase} in [${repoDisplayName}](${event.payload.issue.html_url})`)
      break;
    }
    case 'MemberEvent': {
      console.log(`Last seen inviting [${event.payload.member.name}](${event.payload.member.name}) to work on https://github.com/${repoDisplayName}`)
      break;
    }
    case 'PublicEvent': {
      console.log(`Last seen publicizing [${event.repo.name}](https://github.com/${event.repo.name})`)
      break;
    }
    case 'PullRequestEvent': { break; }
    case 'PullRequestReviewEvent': {
      console.log(`Last seen reviewing [${event.payload.pull_request.number}](${event.payload.pull_request.html_url}) in in [${repoDisplayName}](${event.payload.pull_request.html_url})`)
      break;
    }
    case 'PullRequestReviewCommentEvent': {
      console.log(`Last seen [commenting](${event.payload.comment.html_url}) on [#${event.payload.pull_request.id}](${event.payload.pull_request.html_url})`)
      break;
    }
    case 'PushEvent': {
      console.log(BuildPushEventString(event));
      break;
    }
    case 'ReleaseEvent': {
      console.log(`Last seen publishing a [release](${event.payload.release.html_url}) for [${repoDisplayName}](https://github.com/${event.repo.name}) `);
      break;
    }
    case 'SponsorshipEvent': {
      console.log(`Last seen sponsoring ${repoDisplayName}`);
      break;
    }
    case 'WatchEvent': {
      console.log(`Last seen watching ${repoDisplayName}`)
    }
  }
})
