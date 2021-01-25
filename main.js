`use strict`;

// delete Memory.ccs;
console.log(`restart!`);

let system = new (require(`system`))(`ccs`);

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
