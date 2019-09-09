---
name: owe.js
date: "2015-02"
url: http://owejs.github.io/core/
repo: https://github.com/owejs/owe
---
The **O**bject **W**eb **E**xposer is essentially a JavaScript RPC library to build protocol independent APIs.
owe.js dynamically builds a mutable object graph that can be configured to automatically align to an application's internal object graph.
This overlay graph can be exposed via various protocols.

A usable core implementation has been completed.
However I decided to put this project on hold because making remote object access fully transparent [might not actually be a good idea](http://blog.carlosgaldino.com/a-critique-of-the-remote-procedure-call-paradigm-30-years-later.html).

The core ideas I explored in this project were:
- Translating interactions with JavaScript objects into intuitive interactions with protocols like HTTP, WebSockets, zmq...
- Specifying (conditional) deviations of the exposed object graph from the internal object graph, e.g. some properties or methods should maybe only be accessible to authenticated users.
- How to expose Observables/EventEmitters in a protocol-independent fashion.
