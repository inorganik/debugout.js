/*

    debugout.js
    by @inorganik
    v 0.1.0
    
*/

// save all the console.logs
function debugout() {
	var self = this;

	// OPTIONS
	self.realTimeLoggingOn = true; // log in real time (forwards to console.log)
	self.useTimestamps = true; // insert a timestamp in front of each log
	self.useLocalStorage = false; // store the output using window.localStorage()
	self.continuous = true; // if using localStorage, will continue to add to the same file each session, with dividers

	// vars
	self.depth = 0;
	self.currentResult = '';
	self.startTime = new Date();
	self.output = '';

	this.log = function(obj) {
		// log in real time
		if (self.realTimeLoggingOn) console.log(obj);
		// record log
		var type = self.determineType(obj);
		var addition = self.formatType(type, obj);
		// timestamp, formatted for brevity
		if (self.useTimestamps) {
			var logTime = new Date();
			self.output += self.formatTimestamp(logTime);
		}
		self.output += addition+'\n';
		// local storage
		if (self.useLocalStorage) {
			var last = new Date();
			var saveObject = {
				startTime: self.startTime,
				log: self.output,
				lastLog: last
			}
			saveObject = JSON.stringify(saveObject);
			window.localStorage.setItem('debugout.js', saveObject);
		}
		// for objects - reset
		self.depth = 0;
		self.currentResult = '';
	}
	// like typeof but classifies objects of type 'object'
	// kept separate from formatType() so you can use at your convenience!
	this.determineType = function(object) {
		var typeResult;
		var type = typeof object;
		if (type == 'object') {
			var len = object.length;
			if (len == null) {
				if (typeof object.getTime == 'function') {
					typeResult = 'Date';
				}
				else if (typeof object.test == 'function') {
					typeResult = 'RegExp';
				}
				else {
					typeResult = 'Object';
				}
			} else {
				typeResult = 'Array';
			}
		} else {
			typeResult = type;
		}
		return typeResult;
	}
	// format type accordingly, recursively if necessary
	this.formatType = function(type, obj) {
		switch(type) {
			case 'Object' :
				self.currentResult += '{\n';
				self.depth++;
				for (var prop in obj) {
					self.currentResult += self.indentsForDepth(self.depth);
					self.currentResult += prop + ': ';
					var subtype = self.determineType(obj[prop]);
					var subresult = self.formatType(subtype, obj[prop]);
					if (subresult) self.currentResult += subresult + ',\n';
				}
				self.depth--;
				self.currentResult += self.indentsForDepth(self.depth);
				self.currentResult += '},\n';
				if (self.depth == 0) return self.currentResult;
				break;
			case 'Array' :
				var arr = [];
				self.depth++;
				for (var i = 0; i < obj.length; i++) {
					var subtype = self.determineType(obj[i]);
					arr.push(self.formatType(subtype, obj[i]));
				}
				self.depth--;
				return '['+arr.join(', ')+']';
				break;
			case 'RegExp' :
				return '/'+obj.source+'/';
				break;
			case 'Date' :
			case 'string' : 
				if (self.depth > 0) {
					return '"'+obj+'"';
				} else {
					return obj;
				}
			case 'boolean' :
			case 'number' :
			case 'function' :
				return obj;
				break;
		}
	}
	this.indentsForDepth = function(depth) {
		var str = '';
		for (var i = 0; i < depth; i++) {
			str += '\t';
		}
		return str;
	}
	this.getLog = function() {
		var endTime = new Date();
		// if using local storage, get values
		if (self.useLocalStorage) {
			var saved = window.localStorage.getItem('debugout.js');
			if (saved) {
				saved = JSON.parse(saved);
				self.startTime = new Date(saved.startTime);
				self.output = saved.log;
				endTime = new Date(saved.lastLog);
			}
		}
		self.output += '\n---- End of log: '+endTime+' ----\n';
		self.output += self.formatSessionDuration(self.startTime, endTime);
		return self.output
	}
	this.clear = function() {
		self.output = '';
		if (self.useLocalStorage) {
			window.localStorage.removeItem('debugout.js');
		}
	}
	// calculate testing time
	this.formatSessionDuration = function(startTime, endTime) {
		var msec = endTime - startTime;
		var hh = Math.floor(msec / 1000 / 60 / 60);
		var hrs = ('0' + hh).slice(-2);
		msec -= hh * 1000 * 60 * 60;
		var mm = Math.floor(msec / 1000 / 60);
		var mins = ('0' + mm).slice(-2);
		msec -= mm * 1000 * 60;
		var ss = Math.floor(msec / 1000);
		var secs = ('0' + ss).slice(-2);
		msec -= ss * 1000;
		return '---- Session duration: '+hrs+':'+mins+':'+secs+' ----'
	}
	this.formatTimestamp = function(timestamp) {
		var year = timestamp.getFullYear();
		var date = timestamp.getDate();
		var month = ('0' + (timestamp.getMonth() +1)).slice(-2);
		var hrs = Number(timestamp.getHours()); 
		var mins = ('0' + timestamp.getMinutes()).slice(-2);
		var secs = ('0' + timestamp.getSeconds()).slice(-2);
		return '['+ year + '-' + month + '-' + date + ' ' + hrs + ':' + mins + ':'+secs + ']: ';
	}
	this.version = function () { return '0.1.0' }

	// resume and/or start log
	if (self.useLocalStorage && self.continuous) {
		var saved = window.localStorage.getItem('debugout.js');
		if (saved) {
			saved = JSON.parse(saved);
			self.output = saved.log;
			var start = new Date(saved.startTime);
			var end = new Date(saved.lastLog);
			self.output += '\n---- Session end: '+saved.lastLog+' ----\n';
			self.output += self.formatSessionDuration(start, end);
			self.output += '\n\n';
		}
	} 
	self.output += '---- Session started: '+self.startTime+' ----\n\n';
}