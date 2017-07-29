import find from "find";
import path from "path";
import math from "mathjs";
import Promise from "bluebird";


import CMD from "./CommandLine";
import ProcessPNG from "./ProcessPNG";
import BuildPNG from "./BuildPNG";

export default class Main {
	constructor() {
		this.CMD = CMD;
		this.ProcessPNG = ProcessPNG;
		this.BuildPNG = BuildPNG;

		this.Promise = Promise;
		this.find = find;
		this.path = path;

		this.images = [];
		this.imageCount = 0;
	}

	start() {
		const cmd = new this.CMD();
		const params = cmd.setup();

		const folder = this.hasFolderArg(params);
		
		if (folder !== null) {
			const ret = this.findFiles(folder);
		}
	}

	hasFolderArg(args) {
		return (args.length > 0) ? args[0] : null;
	}

	buildImage(inImage) {

		//const image = math.transpose(inImage);
		const image = inImage;

		for (let i = 0; i < image.length; i++) {
			let index = i * this.imageCount;

			const line = image[i];

			this.images.splice(index, 0, line);
		}
	}

	// buildImage(inImage) {

	// 	//const image = math.transpose(inImage);
	// 	const image = inImage;

	// 	for (let i = 0; i < image.length; i++) {
	// 		let index = i * this.imageCount;

	// 		const line = image[i];

	// 		if (this.imageCount === 0) {
	// 			this.images.push(line);
	// 		} else {
	// 			this.squash(line, i);
	// 		}
	// 	}
	// }

	// squash(line, index) {

	// 	let working = this.images[index];

	// 	for (let i = 0; i < line.length; i++) {
	// 		working[i] =+ line[i];
	// 	}

	// 	this.images[index];
	// }



	buildFile(image, numberOfFiles) {
		const builder = new this.BuildPNG();

		builder.build(image, numberOfFiles);
	}

	processFile(file) {
		const buildImage = this.buildImage;
		const png = new this.ProcessPNG(file);

		return png.readFile();
	}

	findFiles(dir) {
		const resolved = this.path.resolve(dir);

		const processFile = this.processFile;
		const doneReading = this.doneReading;

		const files = this.find.fileSync(resolved);


		Promise.map(files, (file) => {
			return this.processFile(file)
				.then(this.buildImage.bind(this))
				.then(() => this.imageCount++);
		})
		.then(() => this.buildFile(this.images, files.length));
	}
}
