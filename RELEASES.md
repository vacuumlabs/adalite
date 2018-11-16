# Releases

In this file we will go over some steps necessary for seting up and using our preffered tool for creating releases release-it. This tool assumes that SSH keys and Git remotes are configured correctly. Since this addtion was done to allow for signed releases this tutorial will cover setting up a GPG key and setting up signing of all comits.

### GPG key

You should follow [Github tutorial](https://help.github.com/articles/managing-commit-signature-verification/) to perform steps necessary to add a GPG key to your account if you have not added it yet. If genreating on Linux based systems GPG generating progam should be pre installed and kept up to date by the system. For other operational systems use the recommended tools. After you have added GPG key to your account you can setup commit signng.

### Commit Signing

#### Terminal

When using terminal to commit and you wish to sign your commits you have couple of options:

1.  Configure Git to sign every commit either for repository by running in the folder `git config commit.gpgsign true` or for your accoutn by using `git config --global commit.gpgsign true`
2.  Sign specific commits by adding argument `-S` when signing your commit or `-s` when singing off on others commits

#### VS Code

If you are using VS Code to commit, you will need to do do the first option for commit signing using terminal and then enable commit signing in VS code which you can find by searching the settings for `git.enableCommmitSigning` or add it to your settings in this form `git.enableCommmitSigning: true`

#### Release-it

Current release-it configuration is setup to sign commits created by this tool.

### Tag signing

Since for creating tags and releases whe should use the tool release-it which is in dev-dependecies of this project, there little to no reason to describe tag signing.

Release-it has been configured to do tag signing by default

### Release-it installation and usage

Since we have this tool in dev dependencies, it will be installed when running `yarn install`. This tool needs repository to include `package.json` file which needs to contain a valid JSON, that can be even empty first time.

For using this tool use `yarn release-it` with correct arguments. Basically most straightforward usage would be to use this calls:

1.  `yarn release-it patch` to release a patch version
2.  `yarn release-it minor` to release a minor version
3.  `yarn release-it major` to release a major version

Other calls can be used and can be found on [release-it website](https://webpro.github.io/release-it/).
