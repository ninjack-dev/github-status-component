#!/usr/bin/env nu

let gh_events = (gh api (gh api /user | from json | get events_url | str replace -r '{.*}' '') | from json)

let updated_events = ($gh_events | each {|event|
    if $event.type == "PushEvent" {
        let updated_commits = ($event.payload.commits | each {|commit|
            let commit_url = $commit.url
            let commit_info = (gh api $commit_url | from json)
            let hash = $commit_info.sha
            let file_path = $"commit_($hash).json"
            $commit_info | to json | save --force $file_path
            ($commit | upsert url $file_path)
        })
        ($event | upsert payload.commits $updated_commits)
    } else {
        $event
    }
})

$updated_events | to json | save --force "./test_events.json"
