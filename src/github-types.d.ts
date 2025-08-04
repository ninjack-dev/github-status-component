import { components } from "@octokit/openapi-types";

// Notes:
// - In some instances, the documentation just describes an object as "user". For simplicity, I went with `simple-user` as the type.

export type GitHubEventType =
  | "CommitCommentEvent"
  | "CreateEvent"
  | "DeleteEvent"
  | "ForkEvent"
  | "GollumEvent"
  | "IssueCommentEvent"
  | "IssuesEvent"
  | "MemberEvent"
  | "PublicEvent"
  | "PullRequestEvent"
  | "PullRequestReviewEvent"
  | "PullRequestReviewCommentEvent"
  | "PullRequestReviewThreadEvent"
  | "PushEvent"
  | "ReleaseEvent"
  | "SponsorshipEvent"
  | "WatchEvent";

export type CommitCommentEventPayload = {
  action: "created",
  comment: components["schemas"]["commit-comment"];
};

export type CreateEventPayload = {
  ref: components["schemas"]["git-ref"] | null;
  ref_type: "repository" | "branch" | "tag";
  master_branch: string;
  description: string | null;
  pusher_type: "user" | string;
};

export type DeleteEventPayload = {
  ref: components["schemas"]["git-ref"];
  ref_type: "branch" | "tag";
};

export type ForkEventPayload = {
  forkee: components["schemas"]["repository"];
};

export type GollumEventPayload = {
  pages: Array<{
    page_name: string;
    title: string;
    summary: string | null;
    action: string;
    sha: string;
    html_url: string;
  }>;
  repository: components["schemas"]["repository"];
  organization?: components["schemas"]["organization"];
  sender: components["schemas"]["simple-user"];
};

export type IssueCommentEventPayload = {
  action: "created" | "edited" | "deleted";
  changes?: {
    body?: {
      from: string;
    };
  };
  issue: components["schemas"]["issue"];
  comment: components["schemas"]["issue-comment"];
};

export type IssuesEventPayload = {
  action:
  | "opened"
  | "edited"
  | "closed"
  | "reopened"
  | "assigned"
  | "unassigned"
  | "labeled"
  | "unlabeled"
  issue: components["schemas"]["issue"];
  changes?: {
    title?: {
      from: string;
    };
    body?: {
      from: string;
    };
  };
  assignee?: components["schemas"]["simple-user"];
  label?: components["schemas"]["label"];
};

export type MemberEventPayload = {
  action: "added";
  member: components["schemas"]["simple-user"];
  changes?: {
    old_permission?: {
      from: string;
    };
  };
};

export type PublicEventPayload = { /* This event returns an empty payload object. */ };

export type PullRequestEventPayload = {
  action:
  | "opened"
  | "edited"
  | "closed"
  | "reopened"
  | "assigned"
  | "unassigned"
  | "review_requested"
  | "review_request_removed"
  | "labeled"
  | "unlabeled"
  | "synchronize"
  number: number;
  changes?: { // This object will be null if `action` is `edited`
    title?: {
      from: string;
    };
    body?: {
      from: string;
    };
  };
  pull_request: components["schemas"]["pull-request"];
  reason: string;
};

export type PullRequestReviewEventPayload = {
  action: "created";
  pull_request: components["schemas"]["pull-request"];
  review: components["schemas"]["pull-request-review"];
};

// This one (and maybe a few others like it) is confusing. Docs say `action` can be `created`, but it says `changes` will only be here if `action` is `edited`?? Base assumption is that `changes` will always be null; need to research.
export type PullRequestReviewCommentEventPayload = {
  action: "created";
  changes?: { body?: { from: string; }; };
  pull_request: components["schemas"]["pull-request"];
  comment: components["schemas"]["pull-request-review-comment"];
};

export type PullRequestReviewThreadEventPayload = {
  action: "resolved" | "unresolved";
  pull_request: components["schemas"]["pull-request"];
  review: components["schemas"]["thread"];
};

export type PushEventPayload = {
  push_id: number;
  size: number;
  distinct_size: number;
  ref: string;
  head: string;
  before: string;
  commits: Array<components["schemas"]["commit"]["commit"]>; // Technically this isn't the type, see https://docs.github.com/en/rest/using-the-rest-api/github-event-types?apiVersion=2022-11-28#event-payload-object-for-pushevent
};

// Another one with a missing `edited` `action`.
export type ReleaseEventPayload = {
  action: "published";
  changes?: {
    body?: {
      from: string;
    };
    name?: {
      from: string;
    };
  };
  release: components["schemas"]["release"];
};

export type SponsorshipEventPayload = {
  action: "created";
  effective_date?: string;
  changes?: {
    privacy_level?: {
      from: string;
    };
    tier?: {
      from: {
        node_id: string;
        created_at: string;
        description: string;
        monthly_price_in_cents: number;
        monthly_price_in_dollars: number;
        name: string;
        is_one_time: boolean;
        is_custom_amount: boolean;
      };
    };
  };
};

export type WatchEventPayload = {
  action: "started";
};

// Create a discriminated union mapping event types to their payloads
type EventPayloadMap = {
  CommitCommentEvent: CommitCommentEventPayload
  CreateEvent: CreateEventPayload
  DeleteEvent: DeleteEventPayload
  ForkEvent: ForkEventPayload
  GollumEvent: GollumEventPayload
  IssueCommentEvent: IssueCommentEventPayload
  IssuesEvent: IssuesEventPayload
  MemberEvent: MemberEventPayload
  PublicEvent: PublicEventPayload
  PullRequestEvent: PullRequestEventPayload
  PullRequestReviewEvent: PullRequestReviewEventPayload
  PullRequestReviewCommentEvent: PullRequestReviewCommentEventPayload
  PullRequestReviewThreadEvent: PullRequestReviewThreadEventPayload
  PushEvent: PushEventPayload
  ReleaseEvent: ReleaseEventPayload
  SponsorshipEvent: SponsorshipEventPayload
  WatchEvent: WatchEventPayload
};

export type GitHubEventOfType<T extends GitHubEventType = GitHubEventType> = Omit<
  components["schemas"]["event"],
  "type" | "payload"
> & {
  type: T;
  payload: EventPayloadMap[T];
};

export type GitHubEvent = {
  [K in GitHubEventType]: GitHubEventOfType<K>;
}[GitHubEventType];
