`use strict`;

// delete Memory.ccs;

let system = new (require(`system`))(`ccs`);
console.log(`restart!`);

module.exports.loop = function () {
    // try {
    system.init();
    system.run();
    system.shut();
    // } catch (err) {
    //     console.log(err);
    //     delete Memory[`ccs`];
    //     system = new (require(`system`))(`ccs`);
    // }
};
