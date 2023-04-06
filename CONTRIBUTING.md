# Contributing guidelines

We welcome any kind of contribution to our software, from simple comment or question to a full fledged [pull request](https://help.github.com/articles/about-pull-requests/).

A contribution can be one of the following cases:

1. you have a question;
1. you think you may have found a bug (including unexpected behavior);
1. you want to make some kind of change to the code base (e.g. to fix a bug, to add a new feature, to update documentation).

The sections below outline the steps in each case.

## You have a question

1. use the search functionality [here](https://github.com/i-VRESSE/workflow-builder/issues) to see if someone already filed the same issue;
1. if your issue search did not yield any relevant results, make a new issue;
1. apply the "Question" label; apply other labels when relevant.

## You think you may have found a bug

1. use the search functionality [here](https://github.com/i-VRESSE/workflow-builder/issues) to see if someone already filed the same issue;
1. if your issue search did not yield any relevant results, make a new issue, making sure to provide enough information to the rest of the community to understand the cause and context of the problem. Depending on the issue, you may want to include:
   - the [SHA hashcode](https://help.github.com/articles/autolinked-references-and-urls/#commit-shas) of the commit that is causing your problem;
   - some identifying information (name and version number) for dependencies you're using;
   - information about the operating system;
1. apply relevant labels to the newly created issue.

## You want to make some kind of change to the code base

1. (**important**) announce your plan to the rest of the community _before you start working_. This announcement should be in the form of a (new) issue;
1. (**important**) wait until some kind of concensus is reached about your idea being a good idea;
1. if needed, fork the repository to your own Github profile and create your own feature branch off of the latest master commit. While working on your feature branch, make sure to stay up to date with the master branch by pulling in changes, possibly from the 'upstream' repository (follow the instructions [here](https://help.github.com/articles/configuring-a-remote-for-a-fork/) and [here](https://help.github.com/articles/syncing-a-fork/));
2. install dependencies with `yarn`;
3. make sure build still works by running `yarn build`;
4. make sure the existing tests still work by running `yarn test -- run`;
5. add your own tests (if necessary);
6. update or expand the documentation;
7. make sure linter is happy with `yarn lint`. Optionally enable automatic lint before committing with `yarn postinstall`;
8. [push](http://rogerdudler.github.io/git-guide/) your feature branch to (your fork of) this repository on GitHub;
9. create the pull request, e.g. following the instructions [here](https://help.github.com/articles/creating-a-pull-request/).

In case you feel like you've made a valuable contribution, but you don't know how to write or run tests for it, or how to generate the documentation: don't let this discourage you from making the pull request; we can help you! Just go ahead and submit the pull request, but keep in mind that you might be asked to append additional commits to your pull request (have a look at some of our old pull requests to see how this works, for example [#1](https://github.com/i-VRESSE/workflow-builder/pull/1)).

## You want to publish a new version

Audience for this chapter are the maintainers of this repo.

There are 3 things that can be published in this repo in this repo:

1. The `packages/core/` directory aka `@i-vresse/wb-core` package, versions of this package are published to npmjs
2. The `packages/form/` directory aka `@i-vresse/wb-form` package, versions of this package are published to npmjs
3. The root of the repo, versions of the repo are published as GitHub releases and Zenodo records.

There is a single [CHANGELOG.md](CHANGELOG.md) that is for consumers of the packages and repo.

### Publish @i-vresse/wb-form package

1. Set version in `packages/form/package.json` with `yarn workspace @i-vresse/wb-form version <patch|minor|major>`
2. Add changes to [CHANGELOG.md](CHANGELOG.md) and push changes to main branch
3. Make sure you are logged in on npm by checking with `yarn npm whoami --scope i-vresse` and optionally login in with `yarn workspace @i-vresse/wb-form npm login --scope i-vresse --publish`
4. Clean `dist/` with `yarn workspace @i-vresse/wb-form clean`, make sure `yarn dev` is not running
5. Build with `yarn workspace @i-vresse/wb-form build`
6. Publish with `yarn workspace @i-vresse/wb-form npm publish --otp <otp code>`
7. Create git tag for version with `git tag @i-vresse/wb-form@${packages/form/package.json:version}` and `git push origin --tags`

### Publish @i-vresse/wb-core package

1. Set version in `packages/core/package.json` with `yarn workspace @i-vresse/wb-core version <patch|minor|major>`
2. Add changes to [CHANGELOG.md](CHANGELOG.md) and push changes to main branch
3. Make sure you are logged see step 3 in chapter above.
4. Clean `dist/` with `yarn workspace @i-vresse/wb-core clean`, make sure `yarn dev` is not running
5. Build with `yarn workspace @i-vresse/wb-core build`
6. Publish with `yarn workspace @i-vresse/wb-core npm publish --otp <otp code>`
7. Create git tag for version with `git tag @i-vresse/wb-core@${packages/core/package.json:version}` and `git push origin --tags`

The `@i-vresse/wb-core` depends on `@i-vresse/wb-form`. 
To use the core package outside this monorepo make sure the version of the form package it needs has been published.

### Publish repository

The root, packages and apps have independend versions. To make a release of the whole repo the versions need to be concatenated.

1. Add changes to [CHANGELOG.md](CHANGELOG.md)
2. Set version in `/package.json` with `yarn version <patch|minor|major>` and push changes to main branch
3. Goto https://github.com/i-VRESSE/workflow-builder/releases/new
4. Create a tag in format 'v' + version value from `/package.json`
5. Set title to `i-VRESSE workflow-builder`
6. Copy `The workflow builder allows you to create a complex TOML formatted config file based on a set of JSON schemas.` to release description
7. Append newest sections in CHANGELOG.md to release description
8. Release it
