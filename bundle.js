'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var find = _interopDefault(require('find'));
var path = _interopDefault(require('path'));
var mathjs = _interopDefault(require('mathjs'));
var Promise = _interopDefault(require('bluebird'));
var Commander = _interopDefault(require('commander'));
var fs = _interopDefault(require('fs'));
var pngjs = _interopDefault(require('pngjs'));

class CommandLine{
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

class ProcessPNG {
	constructor(pngFilePath) {
		this.path = pngFilePath;

		this.fs = fs;
		this.pngjs = pngjs;
		this.Promise = Promise;

		this.PNG = this.pngjs.PNG;
	}

	processFile() {
		console.log("processing file");
		let image = [];

		for (let y = 0; y < this.height; y++) {
			let line = [];

            for (let x = 0; x < this.width; x++) {
                const idx = (this.width * y + x) << 2;
 

	            const pixel = (
	            	this.data[idx] + 
	                this.data[idx+1] +
	                this.data[idx+2]
	            ) / 3;
					// opacity: this.data[idx+3]

				line.push(pixel);
            }

         	image.push(line);
        }

        return image;
	}

	readFile() {
		const processFile = this.processFile;

		return new Promise(
			(resolve, reject) =>
				this.fs
					.createReadStream(this.path)
					.pipe(new this.PNG())
					.on(
						'parsed',
						function() {
							const result = processFile.call(this);
							resolve(result);
						}
					)
					.on('error', reject)
		);
	}
}

class BuildPNG {
	constructor() {

		this.fs = fs;
		this.pngjs = pngjs;
		this.Promise = Promise;

		this.PNG = this.pngjs.PNG;
	}


	build(image, numberOfFiles) {

		const fileHeight = numberOfFiles;

		let val = 0;

		let file = 0;

		let flattened = [];

		for (let i = 0; i < image.length; i++) {
			const line = image[i];
			for (let j = 0; j < line.length; j++) {
				const pixel = line[j];

				flattened.push(pixel, pixel, pixel, 255);
				j = j + 10;
			}

			if (val === fileHeight) {

				const fileWidth = ((flattened.length / 4 ) / fileHeight);

				let dst = new this.PNG({height: fileHeight, width: fileWidth});

				dst.data = flattened;

				dst.pack().pipe(fs.createWriteStream('out' + file + '.png'));
				flattened = [];
				file++;
				val = 0;
			}
			val++;
		}


		file++;
		const fileWidth = (flattened.length / fileHeight);
		let dst = new this.PNG({height: fileHeight, width: fileWidth});

		dst.data = flattened;

		dst.pack().pipe(fs.createWriteStream('out' + file + '.png'));
	}
}

class Main {
	constructor() {
		this.CMD = CommandLine;
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

	// buildImage(inImage) {

	// 	//const image = math.transpose(inImage);
	// 	const image = inImage;

	// 	for (let i = 0; i < image.length; i++) {
	// 		let index = i * this.imageCount;

	// 		const line = image[i];

	// 		this.images.splice(index, 0, line);
	// 	}
	// }

	buildImage(inImage) {

		//const image = math.transpose(inImage);
		const image = inImage;

		for (let i = 0; i < image.length; i++) {
			let index = i * this.imageCount;

			const line = image[i];

			if (this.imageCount === 0) {
				this.images.push(line);
			} else {
				this.squash(line, i);
			}
		}
	}

	squash(line, index) {

		let working = this.images[index];

		for (let i = 0; i < line.length; i++) {
			working[i] =+ line[i];
		}

		this.images[index];
	}



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

new Main().start();
