# DiDNS SERVER

DiDNS is a DNS Server script designed to filter IP addresses provided by the DNS Forwarder in the form of an array and return the IP address with the lowest ping.

DiDNS utilizes the native-dns module (https://github.com/tjfontaine/node-dns) and the ping module.

The foundational script used is from https://github.com/cwbeck/Simple-NodeJS-DNS-Server and has been extended to enable the selection of the IP address with the lowest ping.

## Features

- Select multiple IP addresses and return the one with the lowest ping.

> Note: DiDNS is still in the development stage, so there may still be bugs.

## Tech

- [node.js] - evented I/O for the backend

## Installation

DiDNS requires [Node.js](https://nodejs.org/) to run

Install the dependencies and devDependencies and start the server.

```sh
npm i
npm start
```

How to use

```sh
127.0.0.1:53
```

## Development

Feel free to contribute.!
