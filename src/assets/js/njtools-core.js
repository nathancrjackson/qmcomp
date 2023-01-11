let njtdebug = true;

//NJTools Base
window.njt = new (function(debug)
{
	//Handle debug variable
	if (typeof debug === 'undefined') {this.debug = false; }
	else
	{
		if (debug)
		{
			this.debug = true;
		    let msie = window.navigator.userAgent.indexOf("MSIE ");

		    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))
		    {
		        console.log( "IE detected! No promises made on NJTools functionality here..." );
		    }
		}
		else { this.debug = false; }
	}

	//Logging we can disable if we do not need
	this.log = function ( string )
	{
		if (this.debug) { console.log( string ); }
	}

	this.types = {
		UNKNOWN: -3,
		NAN: -2,
		UNDEFINED: -1,
		NULL: 0,
		BOOLEAN: 1,
		NUMBER: 2,
		BIGINT: 3,
		STRING: 4,
		SYMBOL: 5,
		FUNCTION: 6,
		ARRAY: 7,
		OBJECT: 8,
		INFINITY: 9,
	}

	//NJTools JS helpers
	this.js = new (function()
	{
		this.typeOf = function ( variable )
		{
			let type = typeof variable;

			if (type === "undefined") { return njt.types.UNDEFINED; }
			else if (type === "boolean") { return njt.types.BOOLEAN; }
			else if (type === "number") {
				if (variable === NaN) { return njt.types.NAN; }
				else if (variable === Infinity) { return njt.types.INFINITY; }
				else { return njt.types.NUMBER; }
			}
			else if (type === "bigint") { return njt.types.BIGINT; }
			else if (type === "string") { return njt.types.STRING; }
			else if (type === "symbol") { return njt.types.SYMBOL; }
			else if (type === "function") { return njt.types.FUNCTION; }
			else if (type === "object")
			{
				if (variable === null) { return njt.types.NULL; }
				else if (Array.isArray(variable)) { return njt.types.ARRAY; }
				else { return njt.types.OBJECT; }
			}

			//Can't see how this would be output but if things change better to have it
			return njt.types.UNKNOWN; 
		}
		
		this.validate = function ( object, map )
		{
			for (let key in map)
			{
				if (njt.js.typeOf(object[key]) != map[key])
				{
					return false;
				}
			}

			return true;
		}
		
		//Get random int (min & max inclusive)
		this.getRandomInt = function (min, max)
		{
			max = max + 1; //This make the below inclusive
			min = Math.ceil(min);
			max = Math.floor(max);
			return Math.floor(Math.random() * (max - min) + min);
		}
	
	})();

	//NJTools DOM helpers
	this.dom = new (function()
	{
		this.getElementById = function ( idString )
		{
			return document.getElementById(idString);
		}

		this.getElementsByAttribute = function ( attString )
		{
			return document.querySelectorAll('['+attString+']');
		}

		this.getElementsByAttributeWithValue = function ( attString, attValue )
		{
			return document.querySelectorAll('['+attString+'="'+attValue+'"]');
		}

		this.getElementsByClass = function ( classString )
		{
			return document.getElementsByClassName(classString);
		}

		this.getElementsWhereClassContains = function ( classString )
		{
			return document.querySelectorAll('[class*="'+classString+'"]');
		}

		this.getElementsWhereClassBegins = function ( classString )
		{
			return document.querySelectorAll('[class^="'+classString+'"]');
		}

		this.getElementsWhereClassEnds = function ( classString )
		{
			return document.querySelectorAll('[class$="'+classString+'"]');
		}

	})();
	
	//NJTools "AJAX" helpers
	this.req = new (function()
	{
		/*
		//EXAMPLE ONLOAD FUNCTION
		onloadFunction = function()
		{
			if (request.status === 200)
			{
				onloadFunction(request.responseText);
			}
			else if (request.status >= 300 && request.status <= 399)
			{
				throw "HTTP "+request.status+" error: Request redirect attempted.";
			}
			else if (request.status >= 400 && request.status <= 499)
			{
				throw "HTTP "+request.status+" error: Request error.";
			}
			else if (request.status >= 500 && request.status <= 599)
			{
				throw "HTTP "+request.status+" error: Server could not fulfill request.";
			}
		};
		*/
		
		//Quick GET function
		this.get = function ( path, onloadFunction)
		{
			let request = new XMLHttpRequest();
			request.open('GET', path, true);
			request.onload = onloadFunction;
			request.send();
		}

		//Quick POST function
		this.post = function ( path, postData, onloadFunction)
		{
			let request = new XMLHttpRequest();
			request.open('POST', path, true);
			request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

			let postString = '';
			for (let key in postData)
			{
				if (postString.length > 0)
				{
					postString = postString + '&';
				}
				postString = postString + Structure.encodePOST(key) + '=' + Structure.encodePOST(postData[key]);
			}

			request.onload = onloadFunction;
			request.send(postString);
		}

	})();

	//NJTools event helpers
	this.event = new (function()
	{
		//Function map
		this.funct = new Object();

		//Queue map
		this.queue = new Object();
		
		this.eventHandler = function (e)
		{
			let eventlink = e.target.attributes["njtevent" + e.type];
			if ((typeof eventlink) !== "undefined")
			{

				let eventfunction = njt.event.funct[eventlink.value];
				if ((typeof eventfunction) === "function")
				{
					eventfunction(e);
				}
			}
		};
		
		this.addFunction = function(name, funct)
		{
			njt.event.funct[name] = funct;
		}

		this.createQueue = function(queueName, eventObject, eventName)
		{
			this.queue[queueName] = new this.queueWrapper(eventObject, eventName);
		}

		this.queueWrapper = function(object, eventListenerName)
		{
			this.eventOccured = false;
			this.functionArray = [];

			this.push = function ( inputFunction )
			{
				if (this.eventOccured)
				{
					njt.log('Event '+eventListenerName+' has passed executing immediately');
					inputFunction();
				}
				else
				{
					njt.log('Added function to '+eventListenerName+' queue');
					this.functionArray.push(inputFunction);
				}
			}

			object.addEventListener(eventListenerName, function(evt)
				{
					this.eventOccured = true;
					var arrayLength = this.functionArray.length;
					var index = 0;
					//Had bugs doing this via for loop, changing to while loop fixed it...
					while (index < arrayLength)
					{
						this.functionArray[index](evt);
						index = index + 1;
					}
				}.bind(this)
			);
		}

		this.triggerSyntheticEvent = function(eventObject, eventListenerName, eventDetails)
		{
			eventObject.dispatchEvent(new CustomEvent(eventListenerName, {detail: eventDetails}));
		}

		//When the HTML has loaded but not waiting for CSS, images and frames to finish
		this.createQueue('htmlloaded', document, 'DOMContentLoaded');
		//For when the entire page has loaded
		this.createQueue('pageloaded', window, 'load');
	})();

	//Prep our extensions
	this.id = null;
	this.element = null;
	this.snip = null;
	this.modal = null;
	this.formbuilder = null;

})(njtdebug);
