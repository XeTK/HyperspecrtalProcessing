import fs from "fs";
import pngjs from "pngjs";
import Promise from "bluebird";

export default class ProcessPNG {
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
