/** @MsSql Report v1.0.0
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
			trademarks:[], 
			groups: [], 
			subgroups: [], 
			providers: []
		}, 
		all:{
			warehouses:[], 
			trademarks:[], 
			groups: [], 
			subgroups: [], 
			providers: []
		}, 
		tmp:{
			search:{
				warehouses:[], 
				trademarks:[], 
				groups: [], 
				subgroups: [], 
				providers: []
			},
			namefilter:"",
			searchstring: {
				warehouses:"", 
				trademarks:"", 
				groups: "", 
				subgroups: "", 
				providers: ""
			},
			startdate: new Date(),
			enddate: new Date()
		},
		uids:{
			warehouses:{}, 
			trademarks:{}, 
			groups: {}, 
			subgroups: {}, 
			providers: {}
		},
		uidssearch:{
			warehouses:{}, 
			trademarks:{}, 
			groups: {}, 
			subgroups: {}, 
			providers: {}
		},
		rusnames:{
			warehouses:'Фильтр по складу', 
			trademarks:'Фильтр по торговой марке', 
			groups: 'Фильтр по группе', 
			subgroups: 'Фильтр по подгруппе', 
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
							state_new.uidssearch[type][uid] = _.clone(action.payload[type][uid].toUpperCase());
						}
					}
					state_new.uids = _.clone(action.payload);
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

function loadDataFilters(loadedfilters){
	let all = {warehouses:{'8c92350c-42ae-430f-bf47-5fdd071d6586':'Медитек', 'c08b283-b9db-4da0-bfac-67c1eaa56fda':'Фармин', '0f29ebc3-454f-423e-9767-d97f2bf520d8':'Фитобел', '0ebe45c3-bf1e-4dc2-a7ec-395710ba0398':'Не Ска', '046c44cf-37e3-4179-9b8e-310e119ececf':'Комповид', 'cfaf75ef-4555-459a-80c9-e7b8b389d28a':'Здоровое решение', 'a839e60f-b6f5-4a13-a44c-525f35d2eef8':'Аптекарь', 'eece36db-d0cd-43cc-a589-5ad18d1de86d':'Любимая аптека', '021e66bb-03c2-44ec-aa9a-bd577e2c0e08':'Беролина', 'c0175926-78d2-4e18-987d-2d04948852d3':'Адель', '8d634c77-7a3b-4528-a7e6-107b7f7c97aa':'Аптека для лидчан', 'c268c0ac-0a28-4c13-9751-467bdc785687':'Дежурная аптека'}, trademarks:{'ff8c9678-1818-4745-a9ab-89359497003f':'торг. марка 1', '8b2bbea1-f012-45a8-8da0-0c55366ec92b':'торг. марка 2', '4fc87358-2ce1-47b7-a6bb-0c6852e339d2':'торг. марка 3'}, groups: {'a310f42a-9a3d-43bf-93d4-7ee551fdddca':'группа 1','dfe56dea-26d6-4b2f-b29e-da41484e60c6':'группа 2','1db15830-39cb-44f6-8256-18c026034813':'группа 3'}, subgroups: {'30977cda-6220-45f2-a3b3-30809cf93176':'подгруппа 1','97bad3e1-e9df-4cc6-97ee-6e392189abf2':'подгруппа 2','0afae615-d0e9-4d2d-b875-befb32701971':'подгруппа 3'}, providers: {'c35c9046-d7a4-438f-a71e-d62d5c5a21f7':'поставщик 1','3b882c02-c690-41f0-a4e4-2c60cd8c12aa':'поставщик 2','a9d41fdc-f2f1-4e32-944c-36abab43bbf0':'поставщик 3'}};
	if(loadedfilters){
		mssqlsettings.dispatch({type:'SYNC_ALL', payload: all, filters: loadedfilters});
	} else {
		mssqlsettings.dispatch({type:'SYNC_ALL', payload: all});
	}
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
			if(!_.isEqual(tempfilters, mssqlsettings.getState().filters)){
				if(typeof(tempfilters) !== 'undefined'){
					localStorage.setItem("filters", JSON.stringify(mssqlsettings.getState().filters));
				} else if(!_.isEqual({}, mssqlsettings.getState().filters)){
					localStorage.setItem("filters", JSON.stringify(mssqlsettings.getState().filters));
				}
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
			MsSqlReportPanelFilterComponentsSearch.push(<div><input type="button" className="unrealButton" onClick={this.onClickHandler.bind(this)} id='add' name={this.state.searchcomponent[i]} value={_.clone(mssqlsettings.getState().uids[this.props.data][this.state.searchcomponent[i]])} /></div>);
		}
		
		for(let i = 0; i < this.state.storecomponent.length; i++){
			MsSqlReportPanelFilterComponentsStore.push(<div><input type="button" className="unrealButton" onClick={this.onClickHandler.bind(this)} id='del' name={this.state.storecomponent[i]} value={_.clone(mssqlsettings.getState().uids[this.props.data][this.state.storecomponent[i]])} /></div>);
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
					<MsSqlReportPanelFilterComponents data="warehouses" />
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
			NameFilter:_.clone(mssqlsettings.getState().tmp.namefilter)
		};
    }
      
	componentDidMount() {
		var self = this;
		mssqlsettings.subscribe(function(){ 
			if(!((_.isEqual(self.state.filters, mssqlsettings.getState().filters)) && (_.isEqual(self.state.filter, mssqlsettings.getState().filter)) && ((self.state.NameFilter === mssqlsettings.getState().tmp.namefilter)))){
				self.setState({filters: _.clone(mssqlsettings.getState().filters), filter: _.clone(mssqlsettings.getState().filter), NameFilter:_.clone(mssqlsettings.getState().tmp.namefilter)});
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
			MsSqlReportPanelSavedFilter.push(<option value={j} selected={((_.isEqual(this.state.filters[j].filter, _.clone(mssqlsettings.getState().filter))) && ((this.state.filters[j].tmp.namefilter === _.clone(mssqlsettings.getState().tmp.namefilter))) && (j === this.state.NameFilter))?"selected":""}>{j}</option>);
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