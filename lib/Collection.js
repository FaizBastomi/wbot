class Collection extends Map {
	find(fn = (value, key, collection) => {}, thisArg) {
		if (typeof thisArg !== "undefined") fn = fn.bind(thisArg);
		for (const [key, val] of this) {
			if (fn(val, key, this)) return val;
		}
	}
	setOptions(name, options = {}) {
		if (!name) return name;
		if (!Object.keys(options).length) return options;
		if (!this.has(name)) return `"${name}" is not matched any commands!`;
		let command = this.get(name);
		this.set(name, { ...command, options: { ...command.options, ...options } });
		return this.get(name);
	}
	modify(name, options = {}) {
		if (!name) return name;
		if (!Object.keys(options).length) return options;
		if (!this.has(name)) return `"${name}" is not matched any commands!`;
		let command = this.get(name);
		this.set(name, { ...command, options: { ...command.options, ...options } });
		return this.get(name);
	}
}

module.exports = { Collection };
