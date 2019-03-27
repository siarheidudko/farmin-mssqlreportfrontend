/** MsSql Report v1.0.1
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

let tempfilters;

let mssqlsettings = createStore(editmssqlsettings);
//window.mssqlsettings = mssqlsettings;

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
			popuptext: "",
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
			enddate: new Date(),
			synccount: false
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
			bkgroups: 'Фильтр по группе ТМЦ',
			groups: 'Фильтр по товарной группе', 
			subgroups: 'Фильтр по товарной подгруппе', 
			producer: 'Фильтр по производителю',
			providers: 'Фильтр по поставщику'
		}
	}, action){
		try {
			let state_new = _.clone(state);
			switch (action.type){
				case 'SYNC_ALL':
					state_new.all['warehouses'] = [];
					state_new.tmp.search['warehouses'] = [];
					for(const type in action.payload){
						state_new.all[type] = [];
						state_new.tmp.search[type] = [];
						for(const uid in action.payload[type]){
							state_new.all[type].push(uid);
							state_new.tmp.search[type].push(uid);
							let realname = CyrilicDecoder(action.payload[type][uid]);
							state_new.uidssearch[type][uid] = realname.toUpperCase();
							state_new.uids[type][uid] = realname;
							if((type === 'wh_retail') || (type === 'wh_wholesale')){
								state_new.all['warehouses'].push(uid);
								state_new.tmp.search['warehouses'].push(uid);
								state_new.uidssearch['warehouses'][uid] = realname.toUpperCase();
								state_new.uids['warehouses'][uid] = realname;
							}
						}
						
					}
					if(typeof(action.filters) === 'object'){
						state_new.filters = action.filters;
					}
					state_new.tmp.synccount = true;
					return state_new;
					break;
				case 'SYNC_FILTER':
					state_new.filter[action.filter] = _.clone(action.payload.storecomponent);
					return state_new;
					break;
				case 'CLEAR_FILTER':
					for(const keyfilter in state_new.filter){
						state_new.filter[keyfilter] = [];
					}
					state_new.tmp.search = _.clone(state_new.all);
					for(const keysearchstring in state_new.tmp.searchstring){
						state_new.tmp.searchstring[keysearchstring] = "";
					}
					state_new.tmp.startdate = new Date();
					state_new.tmp.enddate = new Date();
					state_new.tmp.namefilter = "";
					state_new.tmp.typewh = "wh_retail";
					state_new.tmp.popuptext = "Настройки очищены!";
					return state_new;
					break;
				case 'SEARCH_FILTER':
					state_new.tmp.searchstring[action.filter] = _.clone(action.payload.searchstring);
					state_new.tmp.search[action.filter] = [];
					if(action.payload.searchstring.length > 1){
						for(let i = 0; i < state_new.all[action.filter].length; i++){
							if(state_new.uidssearch[action.filter][state_new.all[action.filter][i]].indexOf(action.payload.searchstring.toUpperCase()) !== -1){
								state_new.tmp.search[action.filter].push(state_new.all[action.filter][i]);
							}
						}
					} else {
						state_new.tmp.search[action.filter] = _.clone(state_new.all[action.filter]);
					}
					return state_new;
					break;
				case 'SELECT_FILTER':
					state_new.filter = _.clone(state.filters[action.payload.filter].filter);
					state_new.tmp.namefilter = state.filters[action.payload.filter].tmp.namefilter;
					state_new.tmp.typewh = state.filters[action.payload.filter].tmp.typewh;
					for(const keysearchstring in state_new.tmp.searchstring){
						state_new.tmp.searchstring[keysearchstring] = "";
					}
					state_new.tmp.search[action.payload.filter] = _.clone(state_new.all[action.payload.filter]);
					state_new.tmp.popuptext = "Выбран фильтр \n" + state_new.tmp.namefilter;
					return state_new;
					break;
				case 'EDIT_NAME_FILTER':
					state_new.tmp.namefilter = action.payload.namefilter;
					return state_new;
					break;
				case 'SAVE_FILTER':
					state_new.filters[state_new.tmp.namefilter] = {};
					state_new.filters[state_new.tmp.namefilter].tmp = {};
					state_new.filters[state_new.tmp.namefilter].tmp.namefilter = state.tmp.namefilter;
					state_new.filters[state_new.tmp.namefilter].tmp.typewh = state.tmp.typewh;
					state_new.filters[state_new.tmp.namefilter].filter = _.clone(state.filter);
					return state_new;
					break;
				case 'DELETE_FILTER':
					delete state_new.filters[state_new.tmp.namefilter];
					return state_new;
					break;
				case 'EDIT_DATE':
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
					state_new.tmp.typewh = action.payload.typewh;
					state_new.filter.warehouses = []; //очищаем список выбранных складов
					state_new.filter.wh_retail = []; 
					state_new.filter.wh_wholesale = []; 
					return state_new;
					break;
				case 'MSG_POPUP':
					state_new.tmp.popuptext = action.payload.popuptext;
					if(state_new.tmp.synccount === false){
						state_new.tmp.synccount = true;
					}
					return state_new;
					break;
				default:
					return state_new;
					break;
			}
		} catch(e){
			console.log("Ошибка при обновлении хранилища:" + e);
		}
		return state;
}

//запуск процедуры
function mssqlgo(data){
	if(data.start <= data.end){
		if(data.filter[data.typewh].length === 0){
			data.filter[data.typewh] = _.clone(mssqlsettings.getState().all[data.typewh]);
		}
		data.start = DateSQL(data.start);
		data.end = DateSQL(data.end);
		let flag = true;
		let xmlhttpinc=new XMLHttpRequest();
		xmlhttpinc.onreadystatechange=function() {
			if (this.readyState==4 && this.status==200) { 
			/*	будем слать уведомление через FCM
				let textNotification = new Notification("Отчет MSSQL", {
					body : "Ваш отчет успешно сформирован и находится в папке загрузки!",
					icon : "../images/menu/mssql.png"
				});
				let answerlink = this.responseText;
				textNotification.onclick = function() {
					window.open(answerlink);
					textNotification.close();
				}; */
			} else if(this.readyState==4){
				popup('Сервер не отвечает!');
			} else {
				if(flag){
					popup('Отчет запущен! Ожидайте...');
					flag = false;
				}
			}
		}
		xmlhttpinc.open("POST","mssql-report.php",true);
		xmlhttpinc.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		xmlhttpinc.send('com=exec&exec='+JSON.stringify(data));
	} else {
		popup('Дата начала не может быть больше даты окончания');
	}
};

//декодер кирилицы
function CyrilicDecoder(data){
	try {
		return decodeURIComponent(data.toString()).toString();
	} catch(e){
		console.log('Error decode "' + data + '":' + e);
		return data;
	}
}

//подписка на обновления фильтров
function FiltersOnEdit(){
	console.log("Загрузка выполнена.");
	mssqlsettings.subscribe(function(){ 
		if(!(_.isEqual(tempfilters, mssqlsettings.getState().filters))){
			let xmlhttpinc=new XMLHttpRequest();
			xmlhttpinc.onreadystatechange=function() {
				if (this.readyState==4 && this.status==200) {
					if(this.responseText.substr(0,5) !== 'error'){
						popup('Фильтры изменены!');
						tempfilters = _.clone(mssqlsettings.getState().filters);
					} else {
						if(this.responseText.substr(4) !== ''){
							popup(this.responseText.substr(4));
							tempfilters = _.clone(mssqlsettings.getState().filters);
						} else {
							popup('Не могу сохранить фильтры!');
							tempfilters = _.clone(mssqlsettings.getState().filters);
						}
					}
				} else if(this.readyState==4) {
					popup('Не могу сохранить фильтры, сервер не отвечает!');
					tempfilters = _.clone(mssqlsettings.getState().filters);
				}
			}
			xmlhttpinc.open("POST","mssql-report.php",true);
			xmlhttpinc.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			xmlhttpinc.send('com=saveuserfilters&filters=' + JSON.stringify(mssqlsettings.getState().filters));
		}
	});
}

//загрузка фильтров
function loadDataFilters(loadedfilters){
	let xmlhttpinc=new XMLHttpRequest();
	xmlhttpinc.onreadystatechange=function() {
		if (this.readyState==4 && this.status==200) {
			try{
				if(loadedfilters){
					mssqlsettings.dispatch({type:'SYNC_ALL', payload: JSON.parse(this.responseText), filters: loadedfilters});
					FiltersOnEdit();
				} else {
					mssqlsettings.dispatch({type:'SYNC_ALL', payload: JSON.parse(this.responseText)});
					FiltersOnEdit();
				}
			} catch(e){
				popup(e);
				FiltersOnEdit();
			}
		} else if(this.readyState==4) {
			popup('Не могу загрузить фильтры!');
			FiltersOnEdit();
		}
	}
	xmlhttpinc.open("POST","mssql-report.php",true);
	xmlhttpinc.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xmlhttpinc.send('com=getfilters'); 
}

//всплывающее уведомление
function popup(data){
	if(typeof(data) !== 'string'){
		data = data.toString();
	}
	mssqlsettings.dispatch({type:'MSG_POPUP', payload: {popuptext:data}});
}

//форматирование даты в sql YYYY-MM-DD
function DateSQLSub(data){
	return data.toString().replace( /^([0-9])$/, '0$1' );
}
function DateSQL(data){
	return DateSQLSub(data.getFullYear()) + '-' + DateSQLSub((data.getMonth()+1)) + '-' + DateSQLSub(data.getDate());
}

//загрузка фильтров из в базы данных (запуск без кэша)
function startOnDbRequest(){
	console.log("Загрузка из БД.");
	try {
		let xmlhttp=new XMLHttpRequest();
		xmlhttp.onreadystatechange=function() {
			if (this.readyState==4 && this.status==200) {
				if(this.responseText !== 'null'){
					if(this.responseText.substr(0,5) !== 'error'){
						try {
							let tempfiltersstring = this.responseText;
							if(typeof(tempfiltersstring) === 'string'){
								tempfilters = JSON.parse(tempfiltersstring);
							}
						} catch (e){
							console.error(e);
						}
						if(typeof(tempfilters) === 'object'){
							loadDataFilters(_.clone(tempfilters));
						} else {
							console.warn('Loaded filters is not encode JSON String');
							loadDataFilters();
						}
					} else {
						if(this.responseText.substr(4) !== ''){
							popup(this.responseText.substr(4));
						} else {
							popup('Не могу загрузить сохраненные фильтры!');
						}
						loadDataFilters();
					}
				} else {
					loadDataFilters();
				}
			} else if(this.readyState==4) {
				popup('Не могу загрузить сохраненные фильтры!');
			}
		}
		xmlhttp.open("POST","mssql-report.php",true);
		xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		xmlhttp.send('com=loaduserfilters');
	} catch(e){
		console.log(e);
		loadDataFilters();
	} 
}

//запуск с кэшем
function startOnChache(){
	console.log("Предзагрузка из кэша.");
	let synclocalstorage = false;
	(new Promise(function(resolve, reject){
		if(localStorage){
			let _subscriber = function(){
				mssqlsettings.subscribe(function(){
					if(synclocalstorage === false){
						setTimeout(function(){
							synclocalstorage = false;
							let _upditem = JSON.stringify(mssqlsettings.getState());
							localStorage.setItem('mssqlreportnew', _upditem);
							synclocalstorage = false;
						}, 10000);
					}
				});
			}
			let _item = localStorage.getItem('mssqlreportnew'); 
			if(typeof(_item) === 'string'){
				try{
					let mystore = JSON.parse(_item);
					_item = null;
					if(typeof(mystore.filters) === 'object'){
						mssqlsettings.dispatch({type:'SYNC_ALL', payload: mystore.uids, filters: mystore.filters});
					} else {
						mssqlsettings.dispatch({type:'SYNC_ALL', payload: mystore.uids});
					}
					setTimeout(function(){
						mystore = null;
					}, 1000);
					setTimeout(resolve, 1500, true);
					_subscriber();
				}catch(err){
					_subscriber();
					reject(err);
				}
			} else {
				_subscriber();
				resolve(true);
			}
		} else {
			resolve(true);
		}
	})).catch(function(err){
		console.error(err);
	}).finally(function(){
		startOnDbRequest();
	});
}

startOnChache();

/* VIEW */

//всплывающее уведомление
"use strict"

//занавес перед загрузкой
class Curtain extends React.PureComponent{
	constructor(props, context) {
		super(props, context);
		this.state = {
			synccount: _.clone(mssqlsettings.getState().tmp.synccount),
		};
    }
      
	componentDidMount() {
		let self = this;
		let cancel = mssqlsettings.subscribe(function(){
			if(!(_.isEqual(self.state.synccount, mssqlsettings.getState().tmp.synccount))){
				self.setState({synccount: _.clone(mssqlsettings.getState().tmp.synccount)});
			}
		});
		self.componentWillUnmount = cancel;
	}
      
  	render() {
		let self = this;
		return (
			<div>
				<div className={(self.state.synccount)?"curtain unshow":"curtain show"} />
				<div className={(self.state.synccount)?"Loading unshow":"Loading show"}>
					<text className="TextWhite LoadingText">Загрузка...</text>
				</div>
			</div>
		);
	}
};

//всплывающее уведомление
class MyPopup extends React.PureComponent{
	constructor(props, context) {
		super(props, context);
		this.state = {
			PopupText: _.clone(mssqlsettings.getState().tmp.popuptext),
		};
		this.onDivClickHandler = this.onDivClickHandler.bind(this);
	}
      
	componentDidMount() {
		let self = this;
		let cancel = mssqlsettings.subscribe(function(){
			if(!(_.isEqual(self.state.PopupText, mssqlsettings.getState().tmp.popuptext))){
				self.setState({PopupText: _.clone(mssqlsettings.getState().tmp.popuptext)});
				if(mssqlsettings.getState().tmp.popuptext !== ''){
					setTimeout(function(){mssqlsettings.dispatch({type:'MSG_POPUP', payload: {popuptext:''}});}, 2000);
				}
			}
		});
		self.componentWillUnmount = cancel;
	}
      
  	onDivClickHandler(e) {
		let self = this;
		self.setState({PopupText: ''});
	}
      
  	render() {
		let self = this;
		return (
			<div className={(self.state.PopupText == "")?"popup unshow":"popup show"} onClick={self.onDivClickHandler}>
				<span className="popuptext" id="myPopup">{self.state.PopupText}</span>
			</div>
		);
	}
};

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
		let self = this;
		switch(e.target.id){
			case 'submit':
				mssqlgo( {start : _.clone(mssqlsettings.getState().tmp.startdate), end : _.clone(mssqlsettings.getState().tmp.enddate), filter : _.clone(mssqlsettings.getState().filter), typewh: _.clone(mssqlsettings.getState().tmp.typewh)} );
				break;
			case 'clear':
				mssqlsettings.dispatch({type:'CLEAR_FILTER'});
				break;
		}
	}
      
	componentDidMount() {
		let self = this;
		let cancel = mssqlsettings.subscribe(function(){ 
			if(!((_.isEqual(self.state.startdate, mssqlsettings.getState().tmp.startdate)) && (_.isEqual(self.state.enddate, mssqlsettings.getState().tmp.enddate)))){
				self.setState({startdate: _.clone(mssqlsettings.getState().tmp.startdate), enddate: _.clone(mssqlsettings.getState().tmp.enddate)});
			}
		});
		self.componentWillUnmount = cancel;
	}
	
	render(){
		let self = this;
		return(
			<div className="MyCalendar">
				<DayPickerInput formatDate={formatDate} parseDate={parseDate} format="DD.MM.YYYY" placeholder={`${formatDate(self.state.startdate, 'DD.MM.YYYY', 'ru')}`} value={self.state.startdate} dayPickerProps={{locale: 'ru', localeUtils: MomentLocaleUtils,}} onDayChange={day => mssqlsettings.dispatch({type:'EDIT_DATE', payload:{date:_.clone(day), type:'startdate'}})} />
				<text className="TextWhite">&#8195;-&#8195;</text>
				<DayPickerInput formatDate={formatDate} parseDate={parseDate} format="DD.MM.YYYY" placeholder={`${formatDate(self.state.enddate, 'DD.MM.YYYY', 'ru')}`} value={self.state.enddate} dayPickerProps={{locale: 'ru', localeUtils: MomentLocaleUtils,}} onDayChange={day => mssqlsettings.dispatch({type:'EDIT_DATE', payload:{date:_.clone(day), type:'enddate'}})} />
				&#8195;<button  className="realButton" onClick={self.onBtnClickHandler.bind(self)} id='submit'>Запустить отчет</button>
				&#8195;<button  className="realButton" onClick={self.onBtnClickHandler.bind(self)} id='clear'>Очистить настройки</button>
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
		let cancel = mssqlsettings.subscribe(function(){ 
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
		self.componentWillUnmount = cancel;
	}
	
	onClickHandler(e){
		let self = this;
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
		let self = this;
		let MsSqlReportPanelFilterComponents = new Array;
		let MsSqlReportPanelFilterComponentsStore = new Array;
		let MsSqlReportPanelFilterComponentsSearch = new Array;
		for(let i = 0; i < self.state.searchcomponent.length; i++){
			MsSqlReportPanelFilterComponentsSearch.push(<div title={_.clone(mssqlsettings.getState().uids[_.clone(mssqlsettings.getState().tmp.typewh)][self.state.searchcomponent[i]])}><input type="button" className="unrealButton" onClick={self.onClickHandler.bind(self)} id='add' name={self.state.searchcomponent[i]} value={_.clone(mssqlsettings.getState().uids[_.clone(mssqlsettings.getState().tmp.typewh)][self.state.searchcomponent[i]])} /></div>);
		}
		for(let i = 0; i < self.state.storecomponent.length; i++){
			MsSqlReportPanelFilterComponentsStore.push(<div title={_.clone(mssqlsettings.getState().uids[_.clone(mssqlsettings.getState().tmp.typewh)][self.state.storecomponent[i]])}><input type="button" className="unrealButton" onClick={self.onClickHandler.bind(self)} id='del' name={self.state.storecomponent[i]} value={_.clone(mssqlsettings.getState().uids[_.clone(mssqlsettings.getState().tmp.typewh)][self.state.storecomponent[i]])} /></div>);
		}
		let MsSqlReportPanelFilterComponentsSearchString = <input type="text" className="containerSearchInp" name="searchstring" onChange={self.onChangeHandler.bind(self)} value={self.state.searchstring} />;
		let MsSqlReportPanelFilterComponentsTypeString =  new Array;
		MsSqlReportPanelFilterComponentsTypeString.push(<option value="wh_retail" selected={(self.state.typewh === "wh_retail")?"selected":""}>Розничные склады</option>);
		MsSqlReportPanelFilterComponentsTypeString.push(<option value="wh_wholesale" selected={(self.state.typewh === "wh_wholesale")?"selected":""}>Оптовые склады</option>);
		MsSqlReportPanelFilterComponentsTypeString.push(<option value="warehouses" selected={(self.state.typewh === "warehouses")?"selected":""}>Все склады</option>);
		MsSqlReportPanelFilterComponents.push(<div className="containerSearchBlockCustom"><div className="containerSearchStringCustom">{MsSqlReportPanelFilterComponentsSearchString}</div><div className="containerTypeString"><select size="1" name="typeWH" className="containerTypeStringInp" onChange={self.onChangeHandler.bind(self)}> {MsSqlReportPanelFilterComponentsTypeString} </select></div></div>);
		MsSqlReportPanelFilterComponents.push(<div className="containerSearch">Позиции для отбора<div className="containerSearchDiv">{MsSqlReportPanelFilterComponentsSearch}</div></div>);
		MsSqlReportPanelFilterComponents.push(<div className="containerFiltr">Отобранные позиции<div className="containerFiltrDiv">{MsSqlReportPanelFilterComponentsStore}</div></div>);	
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
		let cancel = mssqlsettings.subscribe(function(){ 
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
		self.componentWillUnmount = cancel;
	}
	
	onClickHandler(e){
		let self = this;
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
		let self = this;
		switch(e.target.name){
			case 'searchstring':
				mssqlsettings.dispatch({type:'SEARCH_FILTER', payload:{searchstring:e.target.value}, filter:self.props.data});
				break;
		}
	}
      
  	render() {
		let self = this;
		let MsSqlReportPanelFilterComponents = new Array;
		let MsSqlReportPanelFilterComponentsStore = new Array;
		let MsSqlReportPanelFilterComponentsSearch = new Array;
		for(let i = 0; i < self.state.searchcomponent.length; i++){
			MsSqlReportPanelFilterComponentsSearch.push(<div  title={_.clone(mssqlsettings.getState().uids[self.props.data][self.state.searchcomponent[i]])}><input type="button" className="unrealButton" onClick={self.onClickHandler.bind(self)} id='add' name={self.state.searchcomponent[i]} value={_.clone(mssqlsettings.getState().uids[self.props.data][self.state.searchcomponent[i]])} /></div>);
		}
		for(let i = 0; i < self.state.storecomponent.length; i++){
			MsSqlReportPanelFilterComponentsStore.push(<div  title={_.clone(mssqlsettings.getState().uids[self.props.data][self.state.storecomponent[i]])}><input type="button" className="unrealButton" onClick={self.onClickHandler.bind(self)} id='del' name={self.state.storecomponent[i]} value={_.clone(mssqlsettings.getState().uids[self.props.data][self.state.storecomponent[i]])} /></div>);
		}
		let MsSqlReportPanelFilterComponentsSearchString = <input type="text" className="containerSearchInp" name="searchstring" onChange={self.onChangeHandler.bind(self)} value={self.state.searchstring} />;
		MsSqlReportPanelFilterComponents.push(<div className="containerSearchString">{MsSqlReportPanelFilterComponentsSearchString}</div>);
		MsSqlReportPanelFilterComponents.push(<div className="containerSearch">Позиции для отбора<div className="containerSearchDiv">{MsSqlReportPanelFilterComponentsSearch}</div></div>);
		MsSqlReportPanelFilterComponents.push(<div className="containerFiltr">Отобранные позиции<div className="containerFiltrDiv">{MsSqlReportPanelFilterComponentsStore}</div></div>);	
		return (
			<div className={"container MsSqlReportPanelFilter" + self.props.data + "Search"}>
				<div className="containerName">{_.clone(mssqlsettings.getState().rusnames[self.props.data])}</div>
				{MsSqlReportPanelFilterComponents}
			</div>
		);
	}
};

//фильтры
class MsSqlReportPanelFilter extends React.PureComponent{	
  	render() {
		return (
			<div className={((window.innerWidth > 1220) && (window.innerWidth < 1392))?"MsSqlReportPanelFilterMidleWidth MsSqlReportPanelFilter":"MsSqlReportPanelFilter"}>
				<div className="MsSqlReportPanelFilterLeft MsSqlReportPanelFilterType1">
					<MsSqlReportPanelFilterComponentsCustom />
				</div>
				<div className="MsSqlReportPanelFilterRight MsSqlReportPanelFilterType2">
					<MsSqlReportPanelFilterComponents data="trademarks" />
				</div>
				<div className={(window.innerWidth > 1220)?"MsSqlReportPanelFilterLeft MsSqlReportPanelFilterType2":"MsSqlReportPanelFilterLeft MsSqlReportPanelFilterType1"}>
					<MsSqlReportPanelFilterComponents data="groups" />
				</div>
				<div className={(window.innerWidth > 1220)?"MsSqlReportPanelFilterRight MsSqlReportPanelFilterType1":"MsSqlReportPanelFilterRight MsSqlReportPanelFilterType2"}>
					<MsSqlReportPanelFilterComponents data="subgroups" />
				</div>
				<div className={(window.innerWidth > 1220)?"MsSqlReportPanelFilterLeft MsSqlReportPanelFilterType1":"MsSqlReportPanelFilterLeft MsSqlReportPanelFilterType1"}>
					<MsSqlReportPanelFilterComponents data="bkgroups" />
				</div>
				<div className={(window.innerWidth > 1220)?"MsSqlReportPanelFilterRight MsSqlReportPanelFilterType2":"MsSqlReportPanelFilterRight MsSqlReportPanelFilterType2"}>
					<MsSqlReportPanelFilterComponents data="producer" />
				</div>
				<div className={(window.innerWidth > 1220)?"MsSqlReportPanelFilterLeft MsSqlReportPanelFilterType2":"MsSqlReportPanelFilterLeft MsSqlReportPanelFilterType1"}>
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
		let self = this;
		let cancel = mssqlsettings.subscribe(function(){ 
			if(!((_.isEqual(self.state.filters, mssqlsettings.getState().filters)) && (_.isEqual(self.state.filter, mssqlsettings.getState().filter)) && ((self.state.NameFilter === mssqlsettings.getState().tmp.namefilter)) && ((self.state.typewh === mssqlsettings.getState().tmp.typewh)))){
				self.setState({filters: _.clone(mssqlsettings.getState().filters), filter: _.clone(mssqlsettings.getState().filter), NameFilter:_.clone(mssqlsettings.getState().tmp.namefilter), typewh:_.clone(mssqlsettings.getState().tmp.typewh)});
			}
		});
		self.componentWillUnmount = cancel;
	}
	
	onChangeHandler(e){
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
		let self = this;
		switch(e.target.id){
			case 'editfilter':
				if(self.state.NameFilter !== ''){
					mssqlsettings.dispatch({type:'SAVE_FILTER'});
				} else {
					popup('Заполните имя фильтра!');
				}
				break;
			case 'delfilter':
				mssqlsettings.dispatch({type:'DELETE_FILTER'});
				break;
		}
	}
      
  	render() {
		let self = this;
		let MsSqlReportPanelSavedFilter = new Array;
		MsSqlReportPanelSavedFilter.push(<option value="">Фильтр не выбран</option>);
		for(const j in self.state.filters) {
			MsSqlReportPanelSavedFilter.push(<option value={j} selected={((_.isEqual(self.state.filters[j].filter, _.clone(mssqlsettings.getState().filter))) && ((self.state.filters[j].tmp.namefilter === _.clone(mssqlsettings.getState().tmp.namefilter))) && ((self.state.filters[j].tmp.typewh === _.clone(mssqlsettings.getState().tmp.typewh))) && (j === self.state.NameFilter))?"selected":""}>{j}</option>);
		}
		return (
			<div className="MsSqlReportPanelSavedFilter">
				{(MsSqlReportPanelSavedFilter.length > 1)?<p><select size="1" name="selectedFilter" onChange={self.onChangeHandler.bind(self)}> {MsSqlReportPanelSavedFilter} </select></p>:""}
				<div><div className="TextWhite">Имя фильтра:</div> <input type="text" name="SetNameFilter" onChange={self.onChangeHandler.bind(self)} value={self.state.NameFilter} /></div>
				<div><button className="realButton" onClick={self.onBtnClickHandler.bind(self)} id='editfilter'>{(typeof(self.state.filters[self.state.NameFilter]) === 'undefined')?"Добавить фильтр":"Изменить фильтр"}</button></div>
				{(typeof(self.state.filters[self.state.NameFilter]) !== 'undefined')?<button className="realButton" onClick={self.onBtnClickHandler.bind(self)} id='delfilter'>Удалить фильтр</button>:""}
			</div>
		);
	}
};

//тело
class MsSqlReportPanel extends React.PureComponent{ 
  	render() {
		return (
			<div className="MsSqlReportPanel">
				<Curtain />
				<MyPopup />
				<div className="MsSqlPanelHeader">
					<MyCalendar />
					<MsSqlReportPanelSavedFilter />
				</div>
				<div className="MsSqlPanelBody">
					<MsSqlReportPanelFilter />
				</div>
			</div>
		);
	}
};

ReactDOM.render(
	<MsSqlReportPanel />,
	document.getElementById('MsSqlReport')
);