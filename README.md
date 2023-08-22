# WGHub
A tool for creating hub-and-spoke WireGuard configurations.

## About
One of the most-touted benefits of WireGuard is its flexibility.
Devices are conceptually peers, and you can set up all manner
of network types, you aren't locked into the hub-and-spoke
model. I appreciate this, but the fact is that for my personal
use, hub-and-spoke is most often what I want. Until now, I've
been writing the configuration files by hand, and relying on my
memory and/or looking at files I've made in the past whenever I
want to add new devices to the network. But really, that sounds
like a job for a computer. WGHub is a tool that takes in data
about the network as a whole, and generates configuration files
for the Hub and all of the Spokes.

## A note about private keys
WGHub manages all of the public keys for a network, but it
does not handle private keys. My personal philosophy (and I
suppose it's up for debate whether or not this is being overly
paranoid) is that you should never transmit private keys, even
over encrypted channels, if you can avoid it. WGHub is primarily*
a frontend app, so if it generates a private key for the hub,
that key will eventually need to be transmitted to the backend,
which I want to avoid.

*and currently, exclusively (but [not forever](https://github.com/tradeJmark/wghub/issues/2))

## Status
WGHub is still in its infancy, but it works fine. It doesn't
manage sensitive data like private keys, so security shouldn't
be a concern. Until more useability features come in, the [typical
workflow](#suggested-workflow) is a little awkward, but still
better than writing and modifying bare text files.

## Try it out
Since WGHub is currently a purely frontend app with no data stored
on the backend, the easiest way to try it is to visit the instance
that I host:

https://wghub.tradejmark.ca

It's also published as a Docker image, if you'd like to self-host,
which will be the typical way to use it [once it includes a
backend](https://github.com/tradeJmark/wghub/issues/2).

```bash
docker run ghcr.io/tradejmark/wghub
```

## Suggested workflow
My [stance on private keys](#a-note-about-private-keys), though I
stand by it, does mean certain steps need to be taken external to
the app, and although there are more useability features in the
pipeline, some concessions need to be made for the fact that WGHub
is nought but an infant at the moment. Here's how I'd suggest using
it.

### Creating a new Hub
- On the backend, run `wg genkey > <hubname>.priv`.
- In the app, click the + button to make a new Hub, giving it
`<hubname>` for a name, and optionally give it a description (this
is only for your own reference, it won't get used in any output).
- On the backend, run `wg pubkey < <hubname>.priv`. Copy the output,
and paste it into the public key field in the app.
- Fill out the remaining data as desired.
- Download the configuration file from the app, and transfer it to
the backend, placing it in the same folder as `<hubname>.priv`.
- Replace the placeholder private key with the real one by running
``sed -i s:"\(priv\)\{10\}000=":`cat <hubname>.priv`:g <hubname>.conf``.
You now have a working Hub config file.

### Adding a new Spoke
Here are some suggestions for creating a new Spoke for devices on
various platforms. Remember, of course, you will need to generate a
new Hub config file every time you add a new Spoke, and replace the
placeholder private key with the real one as in the final step above.

#### Linux
- In your terminal, run `wg genkey > priv`. Run `wg pubkey < priv`
and copy the output.
- In the app, click "New Spoke", and give it a name (this is for your
own reference, and to uniquely identify the spoke, not used in
output), an IP address of your choosing, and paste in the public key.
- Download the configuration file for the Spoke, place it in the same
directory as `priv`, and run ``sed -i s:"\(priv\)\{10\}000=":`cat priv`:g
<spokename>.conf``. You now have a working Spoke config file.

#### Windows
If you have WSL, you can install `wireguard-tools` and proceed as
though you were using Linux. Otherwise, with the WireGuard desktop app,
I suggest the following:

- In the WireGuard app, click the dropdown beside "Add Tunnel", and
choose "Add empty tunnel...". Copy the public key.
- In WGHub, click "New Spoke", and give it a name (this is for your
own reference, and to uniquely identify the spoke, not used in
output), an IP address of your choosing, and paste in the public key.
- Download the config file for the new Spoke.
- In the WireGuard app, copy the private key, then click "Cancel".
- Click "Add Tunnel", and import the config file you downloaded from
WGHub.
- Edit the imported file and replace the placeholder private key
with the one you paste from your clipboard.

#### Android
- In WGHub, click "New Spoke", and give it a name (this is for your
own reference, and to uniquely identify the spoke, not used in
output), and an IP address of your choosing. Leave the public key
blank for now.
- Download the configuration file for the new Spoke. It will have
a placeholder private key.
- Import the file into the WireGuard Android app.
- Edit the file, and click the &#8635; button beside the private key.
This will generate a new private key. Copy the new public key, and
save the configuration.
- Back in WGHub, edit the new Spoke, and paste in the new public key.

### Persisting your data
You're not going to know every Spoke you'll ever need when you first
create a Hub, and you may want to edit the Hub data over time as well.
When, days, months, years later, you want to add a Spoke or make a
change, you're not going to want to rebuild all of the data in the
app from scratch. Currently, WGHub is a frontend-only application,
so you can't save the data back to the server, but at the end of your
session you can click the Export button to get a copy of the data.
Store that somewhere you won't lose it, and whenever you want to make
changes to the Hubs from that file, you can use the Import button
to load it back in.

## Contributing
I'd be honoured if anyone liked this project enough to want to help
improve it. I'd suggest that first you log an issue so we can discuss
it, because I wouldn't want someone to go through the trouble of coding
something without knowing if I'll ever consider accepting it. When a
course of action is agreed on, you can contribute through the typical
workflow of forking, coding, and then making a PR to merge it back into
the `dev` branch.