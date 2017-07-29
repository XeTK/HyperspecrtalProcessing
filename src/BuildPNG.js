import fs from "fs";
import pngjs from "pngjs";
import Promise from "bluebird";

export default class BuildPNG {
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
