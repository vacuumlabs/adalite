General remark: classes are overused in this project. There are 2 rules how not to need them.

Rule1

if possible, work with values (i.e. plain maps/objects) and functions operating on them. For
example TxAux could be simple {inputs, outputs, attributes} map. Then you define two functions:
getTxAuxId and encodeCbor 

Rule2:

If you need some set of functions to have a lot of shared state, but you don't create a really HUGE
number of instances, it's much easier to create a function such as (example for TxAux class):

const txAux = (inputs, outputs, attributes) => {

  function getId() {...}

  function encodeCbor() {...}
  ...
  return {getId, encodeCbor}
}

this is a low priority issue - lower than other stated here
