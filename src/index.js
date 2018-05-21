/** MsSql Report v1.0.0
 * mssql-report.js
 *
 * Copyright (c) 2018-present, 
 * by Siarhei Dudko (admin@sergdudko.tk).
 *
 * LICENSE MIT.
 */
 
"use strict"

import _ from 'lodash';
import {createStore} from 'redux';
import React from 'react';
import ReactDOM from 'react-dom';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import MomentLocaleUtils, {formatDate,parseDate} from 'react-day-picker/moment';

/* CORE */

var mssqlsettings = createStore(editmssqlsettings, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());
function editmssqlsettings(state = {
		filters:{},
		filter:{
			warehouses:[],
			wh_retail:[],
			wh_wholesale:[],
			trademarks:[],
			bkgroups: [],
			groups: [], 
			subgroups: [],
			producer: [],
			providers: []
		}, 
		all:{
			warehouses:[],
			wh_retail:[],
			wh_wholesale:[],
			trademarks:[], 
			bkgroups: [],
			groups: [], 
			subgroups: [],
			producer: [],
			providers: []
		}, 
		tmp:{
			search:{
				warehouses:[], 
				wh_retail:[],
				wh_wholesale:[],
				trademarks:[],
				bkgroups: [],
				groups: [], 
				subgroups: [], 
				producer: [],
				providers: []
			},
			namefilter:"",
			typewh:"wh_retail",
			searchstring: {
				warehouses:"", 
				wh_retail:"",
				wh_wholesale:"",
				trademarks:"", 
				bkgroups: "",
				groups: "", 
				subgroups: "", 
				producer: "",
				providers: ""
			},
			startdate: new Date(),
			enddate: new Date()
		},
		uids:{
			warehouses:{}, 
			wh_retail:{},
			wh_wholesale:{},
			trademarks:{},
			bkgroups: {},
			groups: {}, 
			subgroups: {}, 
			producer: {},
			providers: {}
		},
		uidssearch:{
			warehouses:{}, 
			wh_retail:{},
			wh_wholesale:{},
			trademarks:{}, 
			bkgroups: {},
			groups: {}, 
			subgroups: {}, 
			producer: {},
			providers: {}
		},
		rusnames:{
			warehouses:'Фильтр по складу (все)', 
			wh_retail:'Фильтр по складу (розница)',
			wh_wholesale:'Фильтр по складу (опт)',
			trademarks:'Фильтр по торговой марке', 
			bkgroups: 'Фильтр по группу Bookkepper',
			groups: 'Фильтр по товарной группе', 
			subgroups: 'Фильтр по товарной подгруппе', 
			producer: 'Фильтр по производителю',
			providers: 'Фильтр по поставщику'
		}
	}, action){
		try {
			switch (action.type){
				case 'SYNC_ALL':
					var state_new = _.clone(state);
					for(let type in action.payload){
						for(let uid in action.payload[type]){
							state_new.all[type].push(_.clone(uid));
							state_new.tmp.search[type].push(_.clone(uid));
							let realname = CyrilicDecoder(action.payload[type][uid]);
							state_new.uidssearch[type][uid] = _.clone(realname.toUpperCase());
							state_new.uids[type][uid] = realname;
							if((type === 'wh_retail') || (type === 'wh_wholesale')){
								state_new.all['warehouses'].push(_.clone(uid));
								state_new.tmp.search['warehouses'].push(_.clone(uid));
								state_new.uidssearch['warehouses'][uid] = _.clone(realname.toUpperCase());
								state_new.uids['warehouses'][uid] = realname;
							}
						}
					}
					if(typeof(action.filters) === 'object'){
						state_new.filters = action.filters;
					}
					return state_new;
					break;
				case 'SYNC_FILTER':
					var state_new = _.clone(state);
					state_new.filter[action.filter] = _.clone(action.payload.storecomponent);
					return state_new;
					break;
				case 'CLEAR_FILTER':
					var state_new = _.clone(state);
					for(let keyfilter in state_new.filter){
						state_new.filter[_.clone(keyfilter)] = [];
					}
					state_new.tmp.search = _.clone(state_new.all);
					for(let keysearchstring in state_new.tmp.searchstring){
						state_new.tmp.searchstring[_.clone(keysearchstring)] = "";
					}
					state_new.tmp.startdate = new Date();
					state_new.tmp.enddate = new Date();
					state_new.tmp.namefilter = "";
					state_new.tmp.typewh = "wh_retail";
					return state_new;
					break;
				case 'SEARCH_FILTER':
					var state_new = _.clone(state);
					state_new.tmp.searchstring[action.filter] = _.clone(action.payload.searchstring);
					state_new.tmp.search[action.filter] = [];
					if(action.payload.searchstring.length > 1){
						for(let i = 0; i < state_new.all[action.filter].length; i++){
							if(state_new.uidssearch[action.filter][state_new.all[action.filter][i]].indexOf(action.payload.searchstring.toUpperCase()) !== -1){
								state_new.tmp.search[action.filter].push(_.clone(state_new.all[action.filter][i]));
							}
						}
					} else {
						state_new.tmp.search[action.filter] = _.clone(state_new.all[action.filter]);
					}
					return state_new;
					break;
				case 'SELECT_FILTER':
					var state_new = _.clone(state);
					state_new.filter = _.clone(state.filters[action.payload.filter].filter);
					state_new.tmp.namefilter = _.clone(state.filters[action.payload.filter].tmp.namefilter);
					state_new.tmp.typewh = _.clone(state.filters[action.payload.filter].tmp.typewh);
					for(let keysearchstring in state_new.tmp.searchstring){
						state_new.tmp.searchstring[_.clone(keysearchstring)] = "";
					}
					state_new.tmp.search[action.payload.filter] = _.clone(state_new.all[action.payload.filter]);
					return state_new;
					break;
				case 'EDIT_NAME_FILTER':
					var state_new = _.clone(state);
					state_new.tmp.namefilter = _.clone(action.payload.namefilter);
					return state_new;
					break;
				case 'SAVE_FILTER':
					var state_new = _.clone(state);
					state_new.filters[state_new.tmp.namefilter] = {};
					state_new.filters[state_new.tmp.namefilter].tmp = {};
					state_new.filters[state_new.tmp.namefilter].tmp.namefilter = _.clone(state.tmp.namefilter);
					state_new.filters[state_new.tmp.namefilter].tmp.typewh = _.clone(state.tmp.typewh);
					state_new.filters[state_new.tmp.namefilter].filter = _.clone(state.filter);
					return state_new;
					break;
				case 'DELETE_FILTER':
					var state_new = _.clone(state);
					delete state_new.filters[state_new.tmp.namefilter];
					return state_new;
					break;
				case 'EDIT_DATE':
					var state_new = _.clone(state);
					switch(action.payload.type){
						case 'startdate':
							state_new.tmp.startdate = action.payload.date;
							break;
						case 'enddate':
							state_new.tmp.enddate = action.payload.date;
							break;
					}
					return state_new;
					break;
				case 'SELECT_TYPE_WH':
					var state_new = _.clone(state);
					state_new.tmp.typewh = action.payload.typewh;
					state_new.filter.warehouses = []; //очищаем список выбранных складов
					state_new.filter.wh_retail = []; 
					state_new.filter.wh_wholesale = []; 
					return state_new;
					break;
				default:
					break;
			}
		} catch(e){
			console.log("Ошибка при обновлении хранилища:" + e);
		}
		return state;
}

function mssqlgo(data){
	alert(JSON.stringify(data));
};

function CyrilicDecoder(data){
	try {
		return decodeURI(data.toString()).toString();
	} catch(e){
		console.log('Error decode "' + data + '":' + e);
		return data;
	}
}

function loadDataFilters(loadedfilters){
	let xmlhttp=new XMLHttpRequest();
	xmlhttp.onreadystatechange=function() {
		if (this.readyState==4 && this.status==200) {
			if(loadedfilters){
				mssqlsettings.dispatch({type:'SYNC_ALL', payload: JSON.parse(this.responseText), filters: loadedfilters});
			} else {
				mssqlsettings.dispatch({type:'SYNC_ALL', payload: JSON.parse(this.responseText)});
			}
		}
	}
	xmlhttp.open("POST","mssql-report.php",true);
	xmlhttp.send();
}

//сохранение фильтров в localStorage
if(typeof(window.localStorage) !== 'undefined'){
	try {
		let tempfiltersstring = window.localStorage.getItem("filters");
		var tempfilters;
		try {
			if(typeof(tempfiltersstring) === 'string'){
				tempfilters = JSON.parse(tempfiltersstring);
			}
		} catch (e){
			console.log(e);
		}
		if(typeof(tempfilters) === 'object'){
			loadDataFilters(_.clone(tempfilters));
		} else {
			console.log('window.localStorage["filters"] is not encode JSON String');
			loadDataFilters();
		}
		mssqlsettings.subscribe(function(){ 
			if(JSON.stringify(tempfilters) === JSON.stringify(mssqlsettings.getState().filters)){ 
				localStorage.setItem("filters", JSON.stringify(mssqlsettings.getState().filters));
				tempfilters = mssqlsettings.getState().filters;
			}
		});
	} catch(e){
		console.log(e);
		loadDataFilters();
	}
} else {
	loadDataFilters();
}

/* VIEW */

//подключаю календарь
class MyCalendar extends React.PureComponent{
	
	constructor(props, context){
		super(props, context);
		this.state = {
			startdate:_.clone(mssqlsettings.getState().tmp.startdate),
			enddate:_.clone(mssqlsettings.getState().tmp.enddate)
		};
    }
	
	onBtnClickHandler(e){
		switch(e.target.id){
			case 'submit':
				mssqlgo( {start : _.clone(mssqlsettings.getState().tmp.startdate), end : _.clone(mssqlsettings.getState().tmp.enddate), filter : _.clone(mssqlsettings.getState().filter)} );
				break;
			case 'clear':
				mssqlsettings.dispatch({type:'CLEAR_FILTER'});
				break;
		}
	}
      
	componentDidMount() {
		var self = this;
		mssqlsettings.subscribe(function(){ 
			if(!((_.isEqual(self.state.startdate, mssqlsettings.getState().tmp.startdate)) && (_.isEqual(self.state.enddate, mssqlsettings.getState().tmp.enddate)))){
				self.setState({startdate: _.clone(mssqlsettings.getState().tmp.startdate), enddate: _.clone(mssqlsettings.getState().tmp.enddate)});
			}
		});
	}
	
	render(){
		var self = this;
		return(
			<div className="MyCalendar">
				<DayPickerInput formatDate={formatDate} parseDate={parseDate} format="DD.MM.YYYY" placeholder={`${formatDate(self.state.startdate, 'DD.MM.YYYY', 'ru')}`} value={self.state.startdate} dayPickerProps={{locale: 'ru', localeUtils: MomentLocaleUtils,}} onDayChange={day => mssqlsettings.dispatch({type:'EDIT_DATE', payload:{date:_.clone(day), type:'startdate'}})} />
				&#8195;-&#8195;
				<DayPickerInput formatDate={formatDate} parseDate={parseDate} format="DD.MM.YYYY" placeholder={`${formatDate(self.state.enddate, 'DD.MM.YYYY', 'ru')}`} value={self.state.enddate} dayPickerProps={{locale: 'ru', localeUtils: MomentLocaleUtils,}} onDayChange={day => mssqlsettings.dispatch({type:'EDIT_DATE', payload:{date:_.clone(day), type:'enddate'}})} />
				&#8195;<button onClick={this.onBtnClickHandler.bind(this)} id='submit'>Запустить отчет</button>
				&#8195;<button onClick={this.onBtnClickHandler.bind(this)} id='clear'>Очистить настройки</button>
			</div>
		);
	}
}

//компонент фильтра для складов
class MsSqlReportPanelFilterComponentsCustom extends React.PureComponent{
  
	constructor(props, context){
		super(props, context);
		this.state = {
			storecomponent: _.clone(mssqlsettings.getState().filter[_.clone(mssqlsettings.getState().tmp.typewh)]), //выбранные элементы
			searchcomponent: _.clone(mssqlsettings.getState().tmp.search[_.clone(mssqlsettings.getState().tmp.typewh)]), //найденные элементы
			searchstring: "", //строка поиска
			typewh: _.clone(mssqlsettings.getState().tmp.typewh) //тип склада
		};
	}
      
	componentDidMount() {
		let self = this;
		mssqlsettings.subscribe(function(){ 
			let tempsearchcomponent = _.clone(mssqlsettings.getState().tmp.search[_.clone(mssqlsettings.getState().tmp.typewh)]);
			let tempstorecomponent = _.clone(mssqlsettings.getState().filter[_.clone(mssqlsettings.getState().tmp.typewh)]);
			for(let i = 0; i < tempstorecomponent.length; i++){
				if(tempsearchcomponent.indexOf(tempstorecomponent[i]) !== -1){
					tempsearchcomponent.splice(tempsearchcomponent.indexOf(tempstorecomponent[i]), 1);
				}
			}
			if(!((_.isEqual(self.state.storecomponent, tempstorecomponent)) && (_.isEqual(self.state.searchcomponent, tempsearchcomponent)) && (_.isEqual(self.state.searchstring, mssqlsettings.getState().tmp.searchstring[_.clone(mssqlsettings.getState().tmp.typewh)])) && (self.state.typewh === _.clone(mssqlsettings.getState().tmp.typewh)))){
				self.setState({storecomponent: tempstorecomponent, searchcomponent: tempsearchcomponent, searchstring: _.clone(mssqlsettings.getState().tmp.searchstring[_.clone(mssqlsettings.getState().tmp.typewh)]), typewh: _.clone(mssqlsettings.getState().tmp.typewh)});
			}
		}); 
	}
	
	onClickHandler(e){
		var self = this;
		let tempstorecomponent = _.clone(self.state.storecomponent);
		switch(e.target.id){
			case 'add':
				if(tempstorecomponent.indexOf(e.target.name) === -1){
					tempstorecomponent.push(e.target.name);
				}
				break;
			case 'del':
				console.log();
				if(tempstorecomponent.indexOf(self.state.storecomponent[self.state.storecomponent.indexOf(e.target.name)]) !== -1){
					tempstorecomponent.splice(tempstorecomponent.indexOf(self.state.storecomponent[self.state.storecomponent.indexOf(e.target.name)]), 1);
				}
				break;
		}
		mssqlsettings.dispatch({type:'SYNC_FILTER', payload:{storecomponent:tempstorecomponent}, filter:_.clone(mssqlsettings.getState().tmp.typewh)});
	}
	
	onChangeHandler(e){
		var self = this;
		switch(e.target.name){
			case 'searchstring':
				mssqlsettings.dispatch({type:'SEARCH_FILTER', payload:{searchstring:e.target.value}, filter:_.clone(mssqlsettings.getState().tmp.typewh)});
				break;
			case 'typeWH':
				mssqlsettings.dispatch({type:'SELECT_TYPE_WH', payload:{typewh:e.target.value}});
				break;
		}
	}
      
  	render() {
		let MsSqlReportPanelFilterComponents = new Array;
		let MsSqlReportPanelFilterComponentsStore = new Array;
		let MsSqlReportPanelFilterComponentsSearch = new Array;
		
		for(let i = 0; i < this.state.searchcomponent.length; i++){
			MsSqlReportPanelFilterComponentsSearch.push(<div title={_.clone(mssqlsettings.getState().uids[_.clone(mssqlsettings.getState().tmp.typewh)][this.state.searchcomponent[i]])}><input type="button" className="unrealButton" onClick={this.onClickHandler.bind(this)} id='add' name={this.state.searchcomponent[i]} value={_.clone(mssqlsettings.getState().uids[_.clone(mssqlsettings.getState().tmp.typewh)][this.state.searchcomponent[i]])} /></div>);
		}
		
		for(let i = 0; i < this.state.storecomponent.length; i++){
			MsSqlReportPanelFilterComponentsStore.push(<div title={_.clone(mssqlsettings.getState().uids[_.clone(mssqlsettings.getState().tmp.typewh)][this.state.storecomponent[i]])}><input type="button" className="unrealButton" onClick={this.onClickHandler.bind(this)} id='del' name={this.state.storecomponent[i]} value={_.clone(mssqlsettings.getState().uids[_.clone(mssqlsettings.getState().tmp.typewh)][this.state.storecomponent[i]])} /></div>);
		}
		
		let MsSqlReportPanelFilterComponentsSearchString = <input type="text" className="containerSearchInp" name="searchstring" onChange={this.onChangeHandler.bind(this)} value={this.state.searchstring} />;
		let MsSqlReportPanelFilterComponentsTypeString =  new Array;
		MsSqlReportPanelFilterComponentsTypeString.push(<option value="wh_retail" selected={(this.state.typewh === "wh_retail")?"selected":""}>Розничные склады</option>);
		MsSqlReportPanelFilterComponentsTypeString.push(<option value="wh_wholesale" selected={(this.state.typewh === "wh_wholesale")?"selected":""}>Оптовые склады</option>);
		MsSqlReportPanelFilterComponentsTypeString.push(<option value="warehouses" selected={(this.state.typewh === "warehouses")?"selected":""}>Все склады</option>);
		
		MsSqlReportPanelFilterComponents.push(<div className="containerSearchStringCustom">{MsSqlReportPanelFilterComponentsSearchString}</div>);
		MsSqlReportPanelFilterComponents.push(<div className="containerTypeString"><select size="1" name="typeWH" className="containerTypeStringInp" onChange={this.onChangeHandler.bind(this)}> {MsSqlReportPanelFilterComponentsTypeString} </select></div>);
		MsSqlReportPanelFilterComponents.push(<div className="containerSearch"><div>Позиции для отбора</div>{MsSqlReportPanelFilterComponentsSearch}</div>);
		MsSqlReportPanelFilterComponents.push(<div className="containerFiltr"><div>Отобранные позиции</div>{MsSqlReportPanelFilterComponentsStore}</div>);
			
		return (
			<div className={"container MsSqlReportPanelFilter" + _.clone(mssqlsettings.getState().tmp.typewh) + "Search"}>
				<div className="containerName">{_.clone(mssqlsettings.getState().rusnames[_.clone(mssqlsettings.getState().tmp.typewh)])}</div>
				{MsSqlReportPanelFilterComponents}
			</div>
		);
	}
};

//компонент фильтра.
class MsSqlReportPanelFilterComponents extends React.PureComponent{
  
	constructor(props, context){
		super(props, context);
		this.state = {
			storecomponent: _.clone(mssqlsettings.getState().filter[this.props.data]), //выбранные элементы
			searchcomponent: _.clone(mssqlsettings.getState().tmp.search[this.props.data]), //найденные элементы
			searchstring: "" //строка поиска
		};
	}
      
	componentDidMount() {
		let self = this;
		mssqlsettings.subscribe(function(){ 
			let tempsearchcomponent = _.clone(mssqlsettings.getState().tmp.search[self.props.data]);
			let tempstorecomponent = _.clone(mssqlsettings.getState().filter[self.props.data]);
			for(let i = 0; i < tempstorecomponent.length; i++){
				if(tempsearchcomponent.indexOf(tempstorecomponent[i]) !== -1){
					tempsearchcomponent.splice(tempsearchcomponent.indexOf(tempstorecomponent[i]), 1);
				}
			}
			if(!((_.isEqual(self.state.storecomponent, tempstorecomponent)) && (_.isEqual(self.state.searchcomponent, tempsearchcomponent)) && (_.isEqual(self.state.searchstring, mssqlsettings.getState().tmp.searchstring[self.props.data])))){
				self.setState({storecomponent: tempstorecomponent, searchcomponent: tempsearchcomponent, searchstring: _.clone(mssqlsettings.getState().tmp.searchstring[self.props.data])});
			}
		}); 
	}
	
	onClickHandler(e){
		var self = this;
		let tempstorecomponent = _.clone(self.state.storecomponent);
		switch(e.target.id){
			case 'add':
				if(tempstorecomponent.indexOf(e.target.name) === -1){
					tempstorecomponent.push(e.target.name);
				}
				break;
			case 'del':
				console.log();
				if(tempstorecomponent.indexOf(self.state.storecomponent[self.state.storecomponent.indexOf(e.target.name)]) !== -1){
					tempstorecomponent.splice(tempstorecomponent.indexOf(self.state.storecomponent[self.state.storecomponent.indexOf(e.target.name)]), 1);
				}
				break;
		}
		mssqlsettings.dispatch({type:'SYNC_FILTER', payload:{storecomponent:tempstorecomponent}, filter:self.props.data});
	}
	
	onChangeHandler(e){
		var self = this;
		switch(e.target.name){
			case 'searchstring':
				mssqlsettings.dispatch({type:'SEARCH_FILTER', payload:{searchstring:e.target.value}, filter:self.props.data});
				break;
		}
	}
      
  	render() {
		let MsSqlReportPanelFilterComponents = new Array;
		let MsSqlReportPanelFilterComponentsStore = new Array;
		let MsSqlReportPanelFilterComponentsSearch = new Array;
		
		for(let i = 0; i < this.state.searchcomponent.length; i++){
			MsSqlReportPanelFilterComponentsSearch.push(<div  title={_.clone(mssqlsettings.getState().uids[this.props.data][this.state.searchcomponent[i]])}><input type="button" className="unrealButton" onClick={this.onClickHandler.bind(this)} id='add' name={this.state.searchcomponent[i]} value={_.clone(mssqlsettings.getState().uids[this.props.data][this.state.searchcomponent[i]])} /></div>);
		}
		
		for(let i = 0; i < this.state.storecomponent.length; i++){
			MsSqlReportPanelFilterComponentsStore.push(<div  title={_.clone(mssqlsettings.getState().uids[this.props.data][this.state.storecomponent[i]])}><input type="button" className="unrealButton" onClick={this.onClickHandler.bind(this)} id='del' name={this.state.storecomponent[i]} value={_.clone(mssqlsettings.getState().uids[this.props.data][this.state.storecomponent[i]])} /></div>);
		}
		
		let MsSqlReportPanelFilterComponentsSearchString = <input type="text" className="containerSearchInp" name="searchstring" onChange={this.onChangeHandler.bind(this)} value={this.state.searchstring} />;
		
		MsSqlReportPanelFilterComponents.push(<div className="containerSearchString">{MsSqlReportPanelFilterComponentsSearchString}</div>);
		MsSqlReportPanelFilterComponents.push(<div className="containerSearch"><div>Позиции для отбора</div>{MsSqlReportPanelFilterComponentsSearch}</div>);
		MsSqlReportPanelFilterComponents.push(<div className="containerFiltr"><div>Отобранные позиции</div>{MsSqlReportPanelFilterComponentsStore}</div>);
			
		return (
			<div className={"container MsSqlReportPanelFilter" + this.props.data + "Search"}>
				<div className="containerName">{_.clone(mssqlsettings.getState().rusnames[this.props.data])}</div>
				{MsSqlReportPanelFilterComponents}
			</div>
		);
	}
};

//фильтры
class MsSqlReportPanelFilter extends React.PureComponent{	
  	render() {
		return (
			<div className="MsSqlReportPanelFilter">
				<div className="MsSqlReportPanelFilterLeft">
					<MsSqlReportPanelFilterComponentsCustom />
				</div>
				<div className="MsSqlReportPanelFilterRight">
					<MsSqlReportPanelFilterComponents data="trademarks" />
				</div>
				<div className="MsSqlReportPanelFilterLeft">
					<MsSqlReportPanelFilterComponents data="groups" />
				</div>
				<div className="MsSqlReportPanelFilterRight">
					<MsSqlReportPanelFilterComponents data="subgroups" />
				</div>
				<div className="MsSqlReportPanelFilterLeft">
					<MsSqlReportPanelFilterComponents data="bkgroups" />
				</div>
				<div className="MsSqlReportPanelFilterRight">
					<MsSqlReportPanelFilterComponents data="producer" />
				</div>
				<div className="MsSqlReportPanelFilterCenter">
					<MsSqlReportPanelFilterComponents data="providers" />
				</div>
			</div>
		);
	}
};

//работа с фильтрами
class MsSqlReportPanelSavedFilter extends React.PureComponent{
  
   constructor(props, context){
		super(props, context);
		this.state = {
			filters:_.clone(mssqlsettings.getState().filters),
			filter:_.clone(mssqlsettings.getState().filter),
			NameFilter:_.clone(mssqlsettings.getState().tmp.namefilter),
			typewh:_.clone(mssqlsettings.getState().tmp.typewh)
		};
    }
      
	componentDidMount() {
		var self = this;
		mssqlsettings.subscribe(function(){ 
			if(!((_.isEqual(self.state.filters, mssqlsettings.getState().filters)) && (_.isEqual(self.state.filter, mssqlsettings.getState().filter)) && ((self.state.NameFilter === mssqlsettings.getState().tmp.namefilter)) && ((self.state.typewh === mssqlsettings.getState().tmp.typewh)))){
				self.setState({filters: _.clone(mssqlsettings.getState().filters), filter: _.clone(mssqlsettings.getState().filter), NameFilter:_.clone(mssqlsettings.getState().tmp.namefilter), typewh:_.clone(mssqlsettings.getState().tmp.typewh)});
			}
		});
	}
	
	onChangeHandler(e){
		var self = this;
		switch(e.target.name){
			case 'SetNameFilter':
				mssqlsettings.dispatch({type:'EDIT_NAME_FILTER', payload: {namefilter:e.target.value}});
				break;
			case 'selectedFilter':
				if(e.target.value !== ""){
					mssqlsettings.dispatch({type:'SELECT_FILTER', payload: {filter:e.target.value}});
				}
				break;
		}
	}
	
	onBtnClickHandler(e){
		var self = this;
		switch(e.target.id){
			case 'editfilter':
				mssqlsettings.dispatch({type:'SAVE_FILTER'});
				break;
			case 'delfilter':
				mssqlsettings.dispatch({type:'DELETE_FILTER'});
				break;
		}
	}
      
  	render() {
		let MsSqlReportPanelSavedFilter = new Array;
		MsSqlReportPanelSavedFilter.push(<option value="">Фильтр не выбран</option>);
		for(let j in this.state.filters) {
			MsSqlReportPanelSavedFilter.push(<option value={j} selected={((_.isEqual(this.state.filters[j].filter, _.clone(mssqlsettings.getState().filter))) && ((this.state.filters[j].tmp.namefilter === _.clone(mssqlsettings.getState().tmp.namefilter))) && ((this.state.filters[j].tmp.typewh === _.clone(mssqlsettings.getState().tmp.typewh))) && (j === this.state.NameFilter))?"selected":""}>{j}</option>);
		}
		
		return (
			<div className="MsSqlReportPanelSavedFilter">
				{(MsSqlReportPanelSavedFilter.length > 1)?<p><select size="1" name="selectedFilter" onChange={this.onChangeHandler.bind(this)}> {MsSqlReportPanelSavedFilter} </select></p>:""}
				<div>Имя фильтра: <input type="text" name="SetNameFilter" onChange={this.onChangeHandler.bind(this)} value={this.state.NameFilter} /></div>
				<div><button onClick={this.onBtnClickHandler.bind(this)} id='editfilter'>{(typeof(this.state.filters[this.state.NameFilter]) === 'undefined')?"Добавить фильтр":"Изменить фильтр"}</button></div>
				{(typeof(this.state.filters[this.state.NameFilter]) !== 'undefined')?<button onClick={this.onBtnClickHandler.bind(this)} id='delfilter'>Удалить фильтр</button>:""}
			</div>
		);
	}
};

//тело
class MsSqlReportPanel extends React.PureComponent{ 
  	render() {
		return (
			<div className="MsSqlReportPanel">
				<MyCalendar />
				{(typeof(window.localStorage) !== 'undefined')?<MsSqlReportPanelSavedFilter />:""}
				<MsSqlReportPanelFilter />
			</div>
		);
	}
};

ReactDOM.render(
	<MsSqlReportPanel />,
	document.getElementById('MsSqlReport')
);