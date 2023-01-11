//Create our app object with our settings
window.app = {
	pageMax: 2, 		//Note how many pages there are
	pageNumber: 1,		//Start on page 1
	pageDisplay: "grid"	//What should our pages be when no hidden
};

//Set our version number (still needs to be updated in pwa-worker.js as that can't access the window context
app.siteVersion = '20221205';

//App init Function
app.init = function()
{
	njt.log('Initialising app');
	
	app.writingTimer;
	app.writingWaitTime = 500;

	//This app is prettier this way
	njt.snip.setCaseSensitive(true);

	//Prepare application objects
	app.load_data();
	
	//Initiate current template variable
	app.currentTemplate = "";

	//Setup our UI
	app.create_interface();

	//Create our form
	app.create_page1content();

	//Show only page 1
	app.set_page(1);

	njt.log('Initialised app');
};

//Run our init once the page is loaded
njt.event.queue['pageloaded'].push(function(){app.init();});

// ---------------------------------------------
//   Build UI functions
// ---------------------------------------------

app.create_interface = function()
{
	//Page 1 elements
	let page1 = {"t": "div", "i": "page1", "c": "gd-cont"};
	let page1form = {"t": "div", "i": "page1form", "c": "gd-l4"};
	let page1preview = {"t": "div", "i": "page1preview", "c": "gd-l8"};
	let page1previewbox = {"t": "pre", "i": "page1previewbox", "a": {"snip-id": "page1preview"}, "h": "Preview goes here"};
	let page1copyinput = {"t": "textarea", "i": "page1copyinput", "a": {"name": "page1copyinput", "rows": 0, "cols": 0, "style": "display:none"}};
	let page1buttons = {"t": "div", "i": "page1buttons", "c": "gd-s12"};
	let displaypage2button = {"t": "button", "a": {"onclick": "window.njt.event.eventHandler(event)", "njteventclick": "displayPage2"}, "h": "Fill in variables"};
	let resetpage1button = {"t": "button", "a": {"onclick": "window.njt.event.eventHandler(event)", "njteventclick": "resetPage1"}, "h": "Reset template"};
	let copytemplatebutton = {"t": "button", "a": {"onclick": "window.njt.event.eventHandler(event)", "njteventclick": "copyPreview"}, "h": "Copy template"};
	
	//Page 2 elements
	let page2 = {"t": "div", "i": "page2", "c": "gd-cont"};
	let page2form = {"t": "div", "i": "page2form", "c": "gd-l4"};
	let page2preview = {"t": "div", "i": "page2preview", "c": "gd-l8"};
	let page2previewbox = {"t": "pre", "i": "page2previewbox", "h": "Preview goes here"};
	let page2copyinput = {"t": "textarea", "i": "page2copyinput", "a": {"name": "page2copyinput", "rows": 0, "cols": 0, "style": "display:none"}};
	let page2buttons = {"t": "div", "i": "page2buttons", "c": "gd-s12"};
	let displaypage1button = {"t": "button", "a": {"onclick": "window.njt.event.eventHandler(event)", "njteventclick": "displayPage1"}, "h": "Modify template"};
	let resetpage2button = {"t": "button", "a": {"onclick": "window.njt.event.eventHandler(event)", "njteventclick": "resetPage2"}, "h": "Reset variables"};
	let copymessagebutton = {"t": "button", "a": {"onclick": "window.njt.event.eventHandler(event)", "njteventclick": "copyPreview"}, "h": "Copy message"};
	
	//Heading buttons
	let opensettingsbutton = {"t": "button", "c": "headingbutton", "a": {"onclick": "window.njt.event.eventHandler(event)", "njteventclick": "openSettings"}, "h": "Settings"};
	let openaboutbutton = {"t": "button", "c": "headingbutton", "a": {"onclick": "window.njt.event.eventHandler(event)", "njteventclick": "openAbout"}, "h": "About"};
	
	//Put pages together
	page1buttons.e = [displaypage2button, resetpage1button, copytemplatebutton];
	page1preview.e = [page1previewbox, page1copyinput];
	page1.e = [page1form, page1preview, page1buttons];
	page2buttons.e = [displaypage1button, resetpage2button, copymessagebutton];
	page2preview.e = [page2previewbox, page2copyinput];
	page2.e = [page2form, page2preview, page2buttons];
	
	//Hide our initial notification
	njt.dom.getElementById('notificationdiv').style.display = "none";
	
	//Load content into page
	let contentwrapper = njt.dom.getElementById("contentwrapper");
	contentwrapper.appendChild(njt.element.buildElementTree(page1));
	contentwrapper.appendChild(njt.element.buildElementTree(page2));
	let headingbuttons = njt.dom.getElementById("headingbuttons");
	headingbuttons.appendChild(njt.element.buildElementTree(opensettingsbutton));
	headingbuttons.appendChild(njt.element.buildElementTree(openaboutbutton));
}

// ---------------------------------------------
//   Data management functions
// ---------------------------------------------

//Function to create sample data
app.create_sampledata = function()
{
	//Putting functions in here as not needed outside of this function
	let create_datasection = function(heading, array)
	{
		let section = {};
		section['h'] = heading;
		section['a'] = array;
		return section;
	};
	let create_datatemplate = function(heading, links)
	{
		let template = {};
		template['h'] = heading;
		template['l'] = links;
		return template;
	};
	let create_datatemplatelink = function(sectionid, required = 0)
	{
		let link = {};
		link['s'] = sectionid;
		link['r'] = required;
		return link;
	};

	let data = {};
	let sections = {};
	let templates = {};
	let variables = {};

	sections['greeting'] = create_datasection(
		'Greeting',
		[
			{v: 'Hi {:Name:},', h: 'Hi {:Name:}'},
			{v: 'Hello {:Name:},', h: 'Hello {:Name:}'},
			{v: 'Good {:TimeOfDay:} {:Name:},', h: 'Good {:TimeOfDay:} {:Name:}'}
		]
	);

	sections['thankyou'] = create_datasection(
		'Thank you',
		[
			{v: 'Thank you for {:YourThanks:}.', h: '...for {:YourThanks:}'},
			{v: 'Thank you for {:YourThanks:} and {:ExtraThanks:}.', h: '...for {:YourThanks:} and {:ExtraThanks:}'}
		]
	);

	sections['iwill'] = create_datasection(
		'I will',
		[
			{v: 'I will update you on {:Subject:} {:Timeframe:}.', h: '...update on {:Subject:}, {:Timeframe:}'},
			{v: 'I will await {:Roadblock:} and follow up of no response by {:Timeframe:}.', h: '...await {:Roadblock:}, follow up {:Timeframe:}'},
			{v: 'I will {:Action:} and update you {:Timeframe:}.', h: '...{:Action:}, update {:Timeframe:}'}
		]
	);

	sections['triedcall'] = create_datasection(
		'Tried calling',
		[
			{v: 'I tried calling you on {:Number:} but you were unavailable.', h: 'on {:Number:}'},
			{v: 'I tried calling you on {:Number:} but you were unavailable so I left a voicemail.', h: 'on {:Number:}, left a voicemail'},
			{v: 'I tried calling you on {:Number:} but spoke with {:Person:} who {:CallSummary:}.', h: 'on {:Number:}, spoke with {:Person:} who {:CallSummary:}'}
		]
	);

	sections['callback'] = create_datasection(
		'Call back',
		[
			{v: 'I will try calling you back {:Timeline:}.', h: 'I will try call you back {:Timeline:}'},
			{v: 'Please call me back when you are free.', h: 'Please call me'}
		]
	);

	sections['extramessage'] = create_datasection(
		'Extra details',
		[
			{v: '{:ExtraDetails:}', h: 'Yes'}
		]
	);

	sections['signoff'] = create_datasection(
		'Sign off',
		[
			{v: 'Regards,', h: 'Regards'},
			{v: 'Kind regards,', h: 'Kind regards'},
			{v: 'Best wishes,', h: 'Best wishes'},
			{v: 'Cheers,', h: 'Cheers'}
		]
	);

	sections['yourname'] = create_datasection(
		'Your name',
		[{v: '{:YourName:}.', h: '{:YourName:}'}]
	);

	variables['timeofday'] = {
		i: 3,
		h: "Time of the day",
		a: [
			{v: 'Morning', h: 'Morning'},
			{v: 'Afternoon', h: 'Afternoon'},
			{v: 'Evening', h: 'Evening'}
		]
	};

	variables['name'] = {
		i: 1,
		h: "Name of client"
	};

	variables['extradetails'] = {
		i: 1,
		r: 4,
		h: "Extra details"
	};

	variables['yourthanks'] = {
		i: 2,
		h: "Thanks for",
		a: [
			{v: 'your time', h: 'your time'},
			{v: 'the call', h: 'the call'},
			{v: 'the email', h: 'the email'},
			{v: 'the message', h: 'the message'}
		]
	};

	let postcallsamplelinks = [];
	postcallsamplelinks.push(create_datatemplatelink('greeting', 2));
	postcallsamplelinks.push(create_datatemplatelink('thankyou', 1));
	postcallsamplelinks.push(create_datatemplatelink('iwill', 0));
	postcallsamplelinks.push(create_datatemplatelink('extramessage', 0));
	postcallsamplelinks.push(create_datatemplatelink('signoff', 2));
	postcallsamplelinks.push(create_datatemplatelink('yourname', 2));

	let triedcallsamplelinks = [];
	triedcallsamplelinks.push(create_datatemplatelink('greeting', 2));
	triedcallsamplelinks.push(create_datatemplatelink('triedcall', 2));
	triedcallsamplelinks.push(create_datatemplatelink('callback', 2));
	triedcallsamplelinks.push(create_datatemplatelink('extramessage', 0));
	triedcallsamplelinks.push(create_datatemplatelink('signoff', 2));
	triedcallsamplelinks.push(create_datatemplatelink('yourname', 2));
	
	//let testdebuglinks = [];
	//testdebuglinks.push(create_datatemplatelink('greeting', 2));

	templates['callsample'] = create_datatemplate('Post call sample', postcallsamplelinks);
	templates['triedcallsample'] = create_datatemplate('Tried calling sample', triedcallsamplelinks);
	//templates['testdebug'] = create_datatemplate('Test/Debug', testdebuglinks);

	//Tie it all together
	data['sections'] = sections;
	data['templates'] = templates;
	data['variables'] = variables;

	return data;
}

app.verify_data = function(dataObject)
{
	//Define our section objects
	let sectionBaseMap = {
		h: njt.types.STRING,
		a: njt.types.ARRAY
	};
	let sectionOptionMap = {
		v: njt.types.STRING,
		h: njt.types.STRING
	};

	//Define our template objects
	let templateBaseMap = {
		h: njt.types.STRING,
		l: njt.types.ARRAY
	};
	let templateLinkMap = {
		s: njt.types.STRING,
		r: njt.types.NUMBER
	};
	
	//Define our variable objects
	let variableBaseMap = {
		i: njt.types.NUMBER
	};
	let variableOptionMap = {
		v: njt.types.STRING,
		h: njt.types.STRING
	};

	//Verify the core objects are correct
	if (njt.js.typeOf(dataObject) != njt.types.OBJECT) { return false; }
	if (njt.js.typeOf(dataObject['sections']) != njt.types.OBJECT) { return false; }
	if (njt.js.typeOf(dataObject['templates']) != njt.types.OBJECT) { return false; }
	
	//Verify each of our sections are valid
	for (let key in dataObject.sections)
	{
		//Check section definition
		if (!njt.js.validate(dataObject.sections[key], sectionBaseMap))
			{ return false; }
		
		//Loop over section arrays to validate them
		for (let i = 0; i < dataObject.sections[key].a.length; i++)
		{
			//Check section option definition
			if (!njt.js.validate(dataObject.sections[key].a[i], sectionOptionMap))
				{ return false; }
		}
	}

	//Verify each of our templates are valid and the linked sections exist
	for (let key in dataObject.templates)
	{
		//Check template definition
		if (!njt.js.validate(dataObject.templates[key], templateBaseMap))
			{ return false;}
		
		//Loop over section arrays to validate them
		for (let i = 0; i < dataObject.templates[key].l.length; i++)
		{
			//Check template link definition
			if (!njt.js.validate(dataObject.templates[key].l[i], templateLinkMap))
				{ return false; }

			//Check linked section exists
			if (dataObject.sections[dataObject.templates[key].l[i].s] == undefined)
				{ return false; }
		}
	}
	
	//It's not required but if there is a variables object verify it
	if (njt.js.typeOf(dataObject['variables']) == njt.types.OBJECT)
	{
		//Verify each of our sections are valid
		for (let key in dataObject.variables)
		{
			//Check section definition
			if (!njt.js.validate(dataObject.variables[key], variableBaseMap))
				{ return false; }
			
			let inputType = dataObject.variables[key].i;
			let headingType = njt.js.typeOf(dataObject.variables[key].h);
			let defaultValueType = njt.js.typeOf(dataObject.variables[key].v);
			let lineCountType = njt.js.typeOf(dataObject.variables[key].l);
			let arrayType = njt.js.typeOf(dataObject.variables[key].a);
			
			/*
				INPUT TYPES
				1 - Input/Textarea
				2 - Datalist
				3 - Select
			*/

			//Make sure headings are strings, undefined or null
			if (headingType != njt.types.STRING && headingType != njt.types.UNDEFINED && headingType != njt.types.NULL)
					{ return false; }

			//Default value applies to all types
			if (defaultValueType != njt.types.STRING && defaultValueType != njt.types.UNDEFINED && defaultValueType != njt.types.NULL)
					{ return false; }
			
			//Row count only really applies to Input/Textarea
			if (inputType == 1)
			{
				if (lineCountType == njt.types.NUMBER)
				{
					if (dataObject.variables[key].r < 1)
						{ return false; }
				}
				else if (lineCountType != njt.types.UNDEFINED && lineCountType != njt.types.NULL)
				{
					return false;
				}
			}

			//Array type only applies to Datalist and Select
			if (inputType == 2 || inputType == 3)
			{
				if (arrayType == njt.types.ARRAY)
				{
					//Loop over section arrays to validate them
					for (let i = 0; i < dataObject.variables[key].a.length; i++)
					{
						//Check section option definition
						if (!njt.js.validate(dataObject.variables[key].a[i], variableOptionMap))
							{ return false; }
					}
				}
				else if (arrayType != njt.types.UNDEFINED && arrayType != njt.types.NULL)
					{ return false; }
			}
		}
	}

	return true;
}

app.load_data = function()
{
	//NOTE: This function assumes app.create_sampledata() always generates valid data

	//Get our data string out of storage
	let dataString = localStorage.getItem('dataString')

	//Prep our dataObject
	let dataObject = null;

	//Check if there is a value
	if (dataString) {

		//Try parse our JSON and verify it
		try
		{
			dataObject = JSON.parse(dataString);
			if (!app.verify_data(dataObject)) { dataObject = app.create_sampledata(); }
		}
		//If errors populate with sample data
		catch (e) { dataObject = app.create_sampledata(); }
	//If no data populate with sample data
	} else {
		dataObject = app.create_sampledata();
	}

	//Load data into app and save
	app.data = dataObject;
	app.save_data();
}

app.save_data = function()
{
	localStorage.setItem('dataString', JSON.stringify(app.data));
}

// ---------------------------------------------
//   Page management functions
// ---------------------------------------------

app.set_page = function(pageNum)
{
	//Make sure page num within range and update where we store this info
	app.pageNumber = pageNum % app.pageMax;
	if (app.pageNumber == 0) { app.pageNumber = app.pageMax; }
	
	//Display our page
	app.display_page();
	
	//Make sure we focus on the first imput for power users
	app.focus_page();
}

app.set_pagenext = function()
{
	app.set_page(app.pageNumber+1);
}

app.set_pageprevious = function()
{
	app.set_page(app.pageNumber-1);
}

app.display_page = function()
{
	//Set element visibilities
	for (let i = 1; i <= app.pageMax; i++)
	{
		if (i == app.pageNumber)
			{ njt.dom.getElementById('page'+i).style.display = app.pageDisplay; }
		else
			{ njt.dom.getElementById('page'+i).style.display = "none"; }
	}
	
	//Display the page our page number is set to
	app['update_page'+app.pageNumber]();
}

app.focus_page = function ()
{
	let elementID = "cat";
	
	if (app.pageNumber == 1) { elementID = "templates-input"; }
	else if (app.pageNumber == 2) { elementID = "snip0-input"; }
	
	if (elementID != "")
	{
		let focusElement = njt.dom.getElementById(elementID);
		
		if (focusElement != null) { focusElement.focus(); }
	}
}

app.update_page1 = function()
{
	//Update our preview
	app.update_page1preview();
}

app.update_page2 = function()
{
	//Create our form and update our preview
	app.create_page2form();
	app.update_page2preview();
}

app.create_page1content = function()
{
	app.create_page1templatedropdown();
	app.create_page1form();
}

app.create_page1templatedropdown = function()
{
	//Start preparing our form
	let formStructure = {
		"t": "njt/form",
		"i": "templateSelect",
		"e": [],
		"a": {
			"onchange": "window.njt.event.eventHandler(event)"
	}};
	
	let needToSetTemplate = true;

	//The first drop down should be our different templates
	templateValues = [];
	for (let key in app.data.templates)
	{
		if (needToSetTemplate)
		{
			app.currentTemplate = key;
			needToSetTemplate = false;
		}
		let templateOption = {
			v: key,
			h: app.data.templates[key].h
		};
		templateValues.push(templateOption);
	}
	templateDropdown = {
		"t": "njt/form/select",
		"i": "templates",
		"c": "gd-s12",
		"l": "Templates",
		"o": templateValues
	};
	formStructure.e.push(templateDropdown);

	let templateSelect = njt.formbuilder.generate(formStructure);
	njt.dom.getElementById('page1form').innerHTML = "";
	njt.dom.getElementById('page1form').appendChild(templateSelect);
	njt.dom.getElementById('templates-input').setAttribute("njteventchange", "templateChange");
}

app.create_page1form = function()
{
	//Start preparing our form
	let formStructure = {
		"t": "njt/form",
		"i": "templateOptions",
		"e": [],
		"a": {
			"onchange": "window.njt.event.eventHandler(event)"
	}};

	let formLinks = app.data['templates'][app.currentTemplate].l;

	let l = formLinks.length;
	for (let i = 0; i < l; i++)
	{	
		let sectionKey = formLinks[i]
		let section = app.data.sections[sectionKey.s];
		//Clone our array so unshift and push do not affect the original
		let sectionArray = [...section.a];
		if (sectionKey.r == 0)
		{
			sectionArray.unshift({v: '', h: ''});
		}
		else if (sectionKey.r == 1)
		{
			sectionArray.push({v: '', h: ''});
		}

		formStructure.e.push( {
			"t":"njt/form/select",
			"i":"section"+i,
			"c":"gd-s12",
			"l":section.h,
			"o": sectionArray
		});
	} 
	
	let templateOptions = njt.formbuilder.generate(formStructure);
	let existingOptions = njt.dom.getElementById('templateOptions');
	
	if (existingOptions == null)
	{
		njt.dom.getElementById('page1form').appendChild(templateOptions);
	}
	else
	{
		existingOptions.outerHTML = templateOptions.outerHTML;
	}

	//There has to be a better way to do this
	for (let i = 0; i < l; i++)
	{
		let formOption = njt.dom.getElementById('section'+i+'-input');
		formOption.setAttribute("njteventchange", "updatePage1Preview");
	}
}

app.create_page2form = function()
{
	app.currentsnips = njt.snip.examineById('page1preview');

	let formStructure = {
		"t": "njt/form",
		"e": [],
		"a": {
			"onchange": "window.njt.event.eventHandler(event)"
		}};

	let l = app.currentsnips.length
	for (let i = 0; i < l; i++)
	{
		//Prep some variables we need
		let snipid = app.currentsnips[i];
		let variable = null;

		//Create our base object
		let formObject = {
				"t":"njt/form/input",
				"i":"snip"+i,
				"c":"gd-s12",
				"l":snipid,
				"p":""
			};

		//Load our variable if available
		if (njt.js.typeOf(app.data.variables) == njt.types.OBJECT)
		{
			if (njt.js.typeOf(app.data.variables[snipid]) == njt.types.OBJECT)
				{ variable = app.data.variables[snipid]; }
			else if (njt.js.typeOf(app.data.variables[snipid.toLowerCase()]) == njt.types.OBJECT)
				{ variable = app.data.variables[snipid.toLowerCase()]; }
		}

		//Load our existing snip value if available
		if (njt.js.typeOf(njt.snip.valueMap[snipid]) !== njt.types.UNDEFINED)
		{
			if (njt.snip.valueMap[snipid] != '')
			{
				formObject.v = njt.snip.valueMap[snipid];
			}
		}
		else if (variable !== null && njt.js.typeOf(variable.v) == njt.types.STRING)
		{
			formObject.v = variable.v;
		}

		//If there is variable data act on it
		if (variable !== null)
		{
			if (njt.js.typeOf(variable.h) == njt.types.STRING)
			{
				formObject.l = variable.h;
			}

			if (variable.i == 2)
			{
				formObject.t = "njt/form/datalist";
				formObject.o = variable.a;
			}
			else if (variable.i == 3)
			{
				formObject.t = "njt/form/select";
				formObject.o = variable.a;
			}
			else
			{
				if (njt.js.typeOf(variable.r) == njt.types.NUMBER && variable.r > 0)
				{
					formObject.t = "njt/form/textarea";
					formObject.r = variable.r;
				}
			}
		}

		formStructure.e.push(formObject);
	}

	let testForm = njt.formbuilder.generate(formStructure);
	njt.dom.getElementById('page2form').innerHTML = "";
	njt.dom.getElementById('page2form').appendChild(testForm);

	////There has to be a better way to do this
	//for (let i = 0; i < l; i++)
	//{
	//	let formOption = njt.dom.getElementById('snip'+i+'-input');
	//
	//	if (njt.snip.valueMap[app.currentsnips[i]] !== undefined)
	//	{
	//		if (njt.snip.valueMap[app.currentsnips[i]] != '')
	//		{
	//			formOption.value = njt.snip.valueMap[app.currentsnips[i]];
	//		}
	//	}
	//
	//	formOption.setAttribute("njteventchange", "updatePage2Preview");
	//}
}

app.update_templatechange = function(forceUpdate = false)
{
	let value = njt.dom.getElementById('templates-input').value;
	
	if (app.currentTemplate !== value || forceUpdate)
	{
		app.currentTemplate = value;
		app.create_page1form();
		app.update_page1preview();
	}

}

app.update_page1preview = function()
{
	let preview = '';
	let l = app.data['templates'][app.currentTemplate].l.length
	let first = true;

	for (let i = 0; i < l; i++)
	{
		let value = njt.dom.getElementById('section'+i+'-input').value;

		if (value !== '')
		{
			if (!first) { preview += "\n\n" }
			else { first = false; }
			preview += value;
		}
	}

	njt.dom.getElementById('page1previewbox').innerHTML = preview;
}

app.update_page2preview = function()
{
	let l = app.currentsnips.length
	for (let i = 0; i < l; i++)
	{
		njt.snip.valueMapPush(app.currentsnips[i], njt.dom.getElementById('snip'+i+'-input').value);
	}

	njt.dom.getElementById('page2previewbox').innerHTML = njt.snip.processString(njt.dom.getElementById('page1previewbox').innerHTML);
}

app.reset_snipvariables = function()
{
	njt.snip.valueMapClear();
	app.set_page(2);
}

app.reset_page = function()
{
	if (app.pageNumber == 1) { app.update_templatechange(true); }
	else if (app.pageNumber == 2) { app.reset_snipvariables(); }
	
	app.focus_page();
}

app.reset_app = function()
{
	njt.snip.valueMapClear();
	app.update_templatechange(true);

	app.set_page(1);
}

njt.event.addFunction("templateChange", function(){app.update_templatechange();});
njt.event.addFunction("updatePage1Preview", function(){app.update_page1preview();});
njt.event.addFunction("updatePage2Preview", function(){app.update_page2preview();});
njt.event.addFunction("displayPage1", function(){app.set_page(1);});
njt.event.addFunction("displayPage2", function(){app.set_page(2);});
njt.event.addFunction("resetPage1", app.reset_page);
njt.event.addFunction("resetPage2", app.reset_page);

// ---------------------------------------------
//   Modal management functions
// ---------------------------------------------

app.display_modalerror = function(message)
{
	let errorBox = njt.dom.getElementById('modalErrorBox');
	errorBox.textContent = message;
	errorBox.style.display = "block";
}

app.close_modal = function()
{
	njt.modal.closeNow();
}

njt.modal.openFunctions["aboutOpen"] = function(event)
{
	//Open the modal
	njt.modal.openNow('aboutModal');
	
	let aboutVersion = njt.dom.getElementById('aboutVersion');
	aboutVersion.textContent = "Version: " + app.siteVersion;
};

njt.modal.openFunctions["datadefinitionOpen"] = function(event)
{
	//Open the modal
	njt.modal.openNow('datadefinitionModal');

	let errorBox = njt.dom.getElementById('modalErrorBox');
	errorBox.style.display = "none";
	errorBox.textContent = "";

	//Parse our JSON
	let dataString = null;
	try
	{
		dataString = JSON.stringify(app.data, null, 4);
		njt.dom.getElementById('page1formdef').value = dataString;
	}
	catch (e)
		{ return false; }
};

njt.modal.closeFunctions["datadefinitionClose"] = function(event)
{
	//Console update
	njt.log("In custom close function for modal triggered by element with id: " + event.target.id);

	if (event.target.id == "modalSaveButton")
	{
		//Parse our JSON
		let dataObject = null;
		try
		{
			dataObject = JSON.parse(njt.dom.getElementById('page1formdef').value);
			if (app.verify_data(dataObject))
			{
				app.data = dataObject;

				app.save_data();
				
				app.close_modal();

				app.create_page1templatedropdown();
				app.create_page1form();

				app.close_modal();

				app.set_page(1);
			}
			else
			{ app.display_modalerror("Form definition did not pass validation"); }

		}
		catch (e)
			{ app.display_modalerror("Form definition not valid JSON"); }
	}
	else if (event.target.id == "modalResetButton")
	{
		app.data = app.create_sampledata();
		app.save_data();
		app.create_page1templatedropdown();
		app.create_page1form();
		app.close_modal();
		app.set_page(1);
	}
	else
	{
		//Just close without saving
		app.close_modal();
		app.focus_page();
	}
};

njt.event.addFunction("openAbout", function(event){ njt.modal.open('aboutModal', event); });
njt.event.addFunction("openSettings", function(event){ njt.modal.open('datadefinitionModal', event); });
njt.event.addFunction("tryCloseModal", function(event){ njt.modal.close(event); });
njt.event.addFunction("copyPreview", function(event)
{
	let inputid = "";
	let sourceid = "";

	if (app.pageNumber == 1)
	{
		inputid = "page1copyinput";
		sourceid = "page1previewbox";
	}
	else if (app.pageNumber == 2)
	{
		inputid = "page2copyinput";
		sourceid = "page2previewbox";
	}

	let clipboardText = document.getElementById(inputid);
	clipboardText.style.display = "block";
	clipboardText.value = document.getElementById(sourceid).innerHTML;
	clipboardText.select();
	clipboardText.setSelectionRange(0, clipboardText.value.length);
	document.execCommand("copy");
	clipboardText.style.display = "none";
});

// ---------------------------------------------
//   Keypress management functions
// ---------------------------------------------


app.trackWritingInputTime = function()
{
    // Clear existing timer
    clearTimeout(app.writingTimer);

    // Start new timer
    app.writingTimer = setTimeout(() => {
		if (app.pageNumber == 2)
			{ app.update_page2preview(); }
    }, app.writingWaitTime);	
}

//Stop anything happening on key down
document.body.addEventListener('keydown', function(event)
{
	if (event.ctrlKey && event.shiftKey)
	{
		if (event.keyCode == 65) { event.returnValue = false; }
		else if (event.keyCode == 67) { event.returnValue = false; }
		else if (event.keyCode == 82) { event.returnValue = false; }
		else if (event.keyCode == 83) { event.returnValue = false; }
		else if (event.keyCode == 90) { event.returnValue = false; }
		else if (event.keyCode == 188) { event.returnValue = false; }
		else if (event.keyCode == 190) { event.returnValue = false; }
		else if (event.keyCode == 191) { event.returnValue = false; }
	}
}, false);

//Trigger on key up
document.body.addEventListener('keyup', function(event)
{
	app.trackWritingInputTime();

	if (event.ctrlKey && event.shiftKey)
	{
		if (event.keyCode == 65) // 65 is a
		{
			njt.event.funct["openAbout"]();
			event.returnValue = false;
		}
		else if (event.keyCode == 67) // 67 is c
		{
			app.update_page2preview();
			njt.event.funct["copyPreview"]();
			event.returnValue = false;
		}
		else if (event.keyCode == 82) // 82 is r
		{
			app.reset_app();
			event.returnValue = false;
		}
		else if (event.keyCode == 83) // 83 is s
		{
			njt.event.funct["openSettings"]();				
			event.returnValue = false;
		}
		else if (event.keyCode == 90) // 90 is z
		{
			app.reset_page();
			event.returnValue = false;
		}
		else if (event.keyCode == 188) // 188 is <
		{
			app.set_pageprevious();
			event.returnValue = false;
		}
		else if (event.keyCode == 190) // 190 is >
		{
			app.set_pagenext();
			event.returnValue = false;
		}
		else if (event.keyCode == 191) // 191 is ?
		{
			app.focus_page();
			event.returnValue = false;
		}
	}
}, false);
