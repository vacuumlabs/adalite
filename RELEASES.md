# Releases

In this file we will go over some steps necessary for setting up and using [release-it](https://webpro.github.io/release-it/) -- our preferred tool for creating releases. This tool assumes that SSH keys and Git remotes are configured correctly. Below you will find information about how to setup an OpenPGP key and use it automatically when signing commits and releases.  This will help secure AdaLite against impostors and allow our users to verify the authenticity of our releases.

### GPG key

If you do not have a key yet, then you will need to take a moment to create one.

Install "Gnu Privacy Guard" (`gpg`) if needed:

* Linux: `gpg` should be pre-installed already, if not use your package manager to install.
* macOS: [GPG Suite](https://gpgtools.org/)
* Windows: [gpg4win](http://gpg4win.org/)
* For other operating systems, use the recommended installation process for your platform.

Once you have `gpg` installed, you can follow [this simple tutorial](https://help.github.com/articles/generating-a-new-gpg-key/) on how to generate a key.

**Note:** the OpenPGP protocol is very powerful and offers many advanced options for securing your digital identity.  We recommend reading more about how it works and [best practices](https://riseup.net/en/gpg-best-practices) before jumping in blindly.  A properly generated / secured key may be used for 10+ years.

### Adding your key to GitHub

Follow this [GitHub tutorial](https://help.github.com/articles/managing-commit-signature-verification/) to add your public key to your GitHub account.  This will allow the platform to verify each commit and present a green icon letting users know it was properly signed.

### Signing your commits

After you have generated a key, and uploaded the public key to your GitHub account, you can setup commit signing in `git`.

#### Terminal

When using terminal you have a couple options when signing commits:

1.  Configure Git to sign every commit either for repository by running in the folder `git config commit.gpgsign true` or for your account by using `git config --global commit.gpgsign true` (recommended)
2.  Sign specific commits by adding argument `-S` when signing your commit or `-s` when singing off on others commits

#### VS Code

If you are using VS Code to commit, you will need to do do the first option for commit signing using terminal and then enable commit signing in VS code which you can find by searching the settings for `git.enableCommmitSigning` or add it to your settings in this form `git.enableCommmitSigning: true`

#### Release-it

The current `release-it` configuration is setup to sign commits by default.

### Tag signing

When creating tags and releases, we should use the tool `release-it` (found is in dev-dependecies of this project). Release-it has been configured to do tag signing by default.

### Release-it installation and usage

Since we have this tool in dev dependencies, it will be installed when running `yarn install`. This tool needs the repository to include a file named `package.json`.  The file must be valid JSON or an empty file the first time it is run.

Use `yarn release-it` with correct arguments. Here are some examples:

1.  `yarn release-it patch` to release a patch version
2.  `yarn release-it minor` to release a minor version
3.  `yarn release-it major` to release a major version

Other calls can be used and can be found on the [release-it website](https://webpro.github.io/release-it/).


## Further considerations

Because anyone can create an OpenPGP key using whatever name / email address they choose, we need a way to establish the authenticity of keys.  This is normally done by publishing a fingerprint of the key onto various platforms (Twitter, GitHub profile, [keybase.io](keybase.io), etc) so that nobody can impersonate you.  Meeting and verifying someone's key fingerprint in-person is the only way to be 100% sure it is real (see below).

### Getting your key fingerprint

`gpg -K --fingerprint YOUR_EMAIL_ADDRESS`

Look for the line saying: `Key fingerprint = `

### Web Of Trust

Developers should also consider meeting each other in person and verifying key fingerprints.  They can then **[sign each other's keys](https://www.phildev.net/pgp/gpgsigning.html)** creating a secure, decentralized web of verified keys.  In projects like Bitcoin Core, this is standard practice amongst developers.
