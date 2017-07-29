import Commander from "commander";

export default class CommandLine{
    constructor() {
        this.application = Commander;
    };

    setup() {
        const app = this.application;

        app
            .version("0.0.1")
            .usage('[options] <folder ...>')
            .parse(process.argv);

        return app.args;
    }
}
