/**
 * @license
 * (c) 2015 pelagie-birds.org All rights reserved.
 * info{at}pelagie-birds{dot}org
 * 
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
function SayiBulmaca (container, options) {	
	if(typeof $ === "undefined") 
		throw "This game requires jQuery in order to run";
	
	if(options == undefined) options = {};
	
	container = $(container);
	
	if(!container.length)
		throw "A valid DOM container is needed for the game";
	
	var defaults = {
		excludeZero:false,
		language: 'en'
	}
	
	var userNumber = "",
		cpuNumber = "",
		probs = [],
		guID,
		userNumberSpan,
		gameButton,
		helpButton,
		gameInput,
		errorModal,
		settingsModal,
		self = this;
	
	options = $.extend({}, defaults, options);
	
	var locale = this.locales[options.language];
	
	var mainButtonFlag = true; //Main Button starts a round or evals a guess
	
	function beginRound() {
		resetGame();
		userNumber=gameInput.val();
		
		if(validNumber(userNumber)) {
			userNumberSpan.html(':&nbsp;' + userNumber);
			cpuNumberAssign();
			toggleGuess();            
		}else {                       
			err(locale.errorInHoldedNumber());
			userNumber="";                               
		}
	}
	
	function validNumber(number) {
		if(number.length!=4) return false;
		
		for(var i=0;i<4;i++) {
			if(number[i]!=parseInt(number[i])) return false;
		}
		
		for(var i=0;i<4;i++) {
			for(var j=0;j<4;j++) {
				if(i!=j&&number[i]==number[j]) return false; 
			}
		}
		
		if(options.excludeZero) {
			if(number.indexOf("0")>-1) {
				return false;
			}
		}
		
		return true;
	}
	
	function cpuNumberAssign() {
		cpuNumber="";
		cpuNumber=rnd();
		
		while(cpuNumber.length!=4) {
			var aday=rnd();
			var ekle=true;  
			
			for(var i=0;i<cpuNumber.length;i++) {
				if(cpuNumber[i]==aday) ekle=false;
			}
			
			if(ekle) cpuNumber+=''+aday;
		}
		
		if(!validNumber(cpuNumber)) {
			cpuNumberAssign();
		}else {
			populateProbs();
		}
		
		return;
	}
	
	function toggleGuess() {
		gameButton.html(locale.guessButton());
		gameInput.attr('placeholder', locale.guessPlaceholder());
		gameInput.val('');
		mainButtonFlag = false;
	}
	
	function rnd() {
		var _rand = Math.floor(Math.random()*10);
		
		if(options.excludeZero) {
				while(_rand == 0) {
					_rand = Math.floor(Math.random()*10);
				}
		}
		
		return _rand; 
	}
	
	function randomGuess() {
		var elms = probs.length-1;
		
		var rand  = Math.random();
		var i=0;
		
		while(rand>1/elms) {
			rand-=1/elms;
			i++;
		}
		
		return probs[i];
	}
	
	function populateProbs() {
		var eleman="";
		var _startFrom = options.excludeZero ? 1 : 0;
		
		for(var i=_startFrom;i<10;i++) {
			for(var j=_startFrom;j<10;j++) {
				if(i!=j) { 
					for(var k=_startFrom;k<10;k++) { 
						if(k!=i&&k!=j) { 
							for(var l=_startFrom;l<10;l++) { 
								if(l!=k&&l!=j&&l!=i) { 
									eleman=i+''+j+''+k+''+l; 
									probs.push(eleman); 
								}
							}
						}
					}
				}
			}
		}
	}
	
	function validGuess(number) { 
		if(number.length!=4) return false;
		
		for(var i=0;i<4;i++) {
			if(number[i]!=parseInt(number[i])) return false;
		}
		
		for(var i=0;i<4;++i) {
			for(var j=0;j<4;++j) {
				if(i==j) continue;
				if(number[i]==number[j]) return false;
			}
		}
		return true;
	}

	function evalGuess(guess, num) { 
		var rtn={}, plus=0, minus=0, text="";
		
		for(var i=0;i<4;i++) {
			for(var j=0;j<4;j++) {
				if(i!=j&&guess[i]==num[j]){
					minus++;
				}else if(i==j&&guess[i]==num[j]){
					plus++;
				}
			}
		}
		
		rtn.arti=plus;
		rtn.eksi=minus;
		rtn.toplam=plus+minus;
		
		if(plus!=0) {
			text=" +"+plus;
		}
		
		if(minus!=0) {
			text+=" -"+minus;
		}
		
		if(plus==0&&minus==0) {
			text=" 0";
		}
		
		rtn.text=text;
		
		return rtn;
	}

	function userGuess() { 
		var guess=gameInput.val();
		
		gameInput.val('').focus();
		
		if(validGuess(guess)) { 
			var result = evalGuess(guess,cpuNumber); 
			var hg     = $("#hgSayiBulmaca_" + getGUID());
			var hr     = $("#hrSayiBulmaca_" + getGUID());
			
			hg.html(hg.html() + guess + '<br />');
			hr.html(hr.html() + result.text + '<br />');
			
			if(result.arti==4) { 
				endGame(1);
			}else {
				cpuGuess();
			}
		}else { 
			err(locale.errorInGuessNumber());
		}
		
		return;
	}

	function cpuGuess() { 
		if(probs.length!=1) { 
			var temp=[]; 
			var guess=randomGuess(); 
			var result=evalGuess(guess, userNumber); 
			var plus=result.arti, minus=result.eksi;
			
			probs.forEach(function(value){ 
				var res=evalGuess(guess, value);
				
				if(res.arti==plus&&res.eksi==minus) temp.push(value); 
			});
			
			probs = temp.slice();

			var cg     = $("#cgSayiBulmaca_" + getGUID());
			var cr     = $("#crSayiBulmaca_" + getGUID());
			
			cg.html(cg.html() + guess + '<br />');
			cr.html(cr.html() + result.text + '<br />');
			
			if(plus==4) { 
				endGame(2);
			}else { 
				toggleGuess();
			}		
		}else { 
			var guess=probs[0];
			var result=evalGuess(guess, userNumber);		
			var cg     = $("#cgSayiBulmaca_" + getGUID());
			var cr     = $("#crSayiBulmaca_" + getGUID());
			
			cg.html(cg.html() + guess + '<br />');
			cr.html(cr.html() + result.text + '<br />');
			endGame(2);
		}
	}

	function endGame(who) { 
		if(who==1) {
			err(locale.userWinText(), locale.userWinTitle());
		}else {
			err(locale.cpuWinText() + '<br />' + locale.cpuNumber() + " " + cpuNumber, locale.cpuWinTitle());
		}
		
		gameButton.html(locale.beginButton());
		gameInput.attr('placeholder', locale.holdNumberPlaceholder());
		mainButtonFlag = true;
	}

	function resetGame() {
		var _t = getGUID();
		
		$('#hgSayiBulmaca_' + _t).html('');
		$('#hrSayiBulmaca_' + _t).html('');
		$('#cgSayiBulmaca_' + _t).html('');
		$('#crSayiBulmaca_' + _t).html('');
		userNumberSpan.html('');
		probs = [];
	}
	
	function setGUID() {
		var _t = "";
		
		for(var i=0;i<13;++i) {
				_t += Math.floor(Math.random() * 10) + '';
		}
		
		guID = _t;
	}
	
	function getGUID() {
		return guID;
	}
	
	function gameButton_Click() {
		if(mainButtonFlag)
			beginRound();
		else
			userGuess();
	}
	
	function init() {
		setGUID();
		appendDOMEnv();
	}
	
	function appendDOMEnv() {
		container.html('');
		
		var cont = $('<div class="sayi-bulmaca sayi-bulmaca_' + getGUID() + '"> \
							<div class="top-area"> \
								<div class="inputs"> \
									<div><input type="text" maxlength="4" placeholder="' + locale.holdNumberPlaceholder() + '" id="txtSayiBulmaca_' + getGUID() + '" /></div> \
									<div><button class="mainBtn" type="button" id="btnSayiBulmaca_' + getGUID() + '">' + locale.beginButton() + '</button></div> \
								</div> \
								<div>' + locale.you() + '<span id="userNumberSayiBulmaca_' + getGUID() + '"></span></div> \
								<div>' + locale.cpu() + '</div> \
							</div> \
							<div class="bottom-area"> \
								<div class="human"> \
									<div class="result-header"> \
										<span>' + locale.guess() + '</span> \
										<span>' + locale.result() + '</span> \
									</div> \
									<div class="guesses" id="hgSayiBulmaca_' + getGUID() + '"></div> \
									<div class="results" id="hrSayiBulmaca_' + getGUID() + '"></div> \
								</div> \
								<div class="cpu"> \
									<div class="result-header"> \
										<span>' + locale.guess() + '</span> \
										<span>' + locale.result() + '</span> \
									</div> \
									<div class="guesses" id="cgSayiBulmaca_' + getGUID() + '"></div> \
									<div class="results" id="crSayiBulmaca_' + getGUID() + '"></div> \
								</div> \
							</div> \
							<div class="footer"> \
								<em>Pélagie Birds</em> \
								<span> \
									<button type="button" class="reloadBtn" id="btnResetSayiBulmaca_' + getGUID() + '"><i class="fa fa-refresh"></i></button> \
								</span> \
								<span> \
									<button type="button" class="settingsBtn" id="btnSettingsSayiBulmaca_' + getGUID() + '"><i class="fa fa-wrench"></i></button> \
								</span> \
								<span> \
									<button type="button" id="btnYardimSayiBulmaca_' + getGUID() + '">?</button> \
								</span> \
							</div> \
						</div>').appendTo(container);
						
		var modal = $('<div id="modalSayiBulmaca_' + getGUID() + '" class="modal fade" role="dialog"> \
						<div class="modal-dialog"> \
							<div class="modal-content"> \
								<div class="modal-header"> \
									<button type="button" class="close" data-dismiss="modal">&times;</button> \
									<h4 class="modal-title" style="font-family:sayiBulmaca;font-size:26px"> \
									' + locale.howToTitle() + '</h4> \
								</div> \
								<div class="modal-body" style="font-family:sayiBulmaca;font-size:21px"> \
									<ol> \
										<li>' + locale.howToList1() + '</li> \
										<li>' + locale.howToList2() + '</li> \
										<li>' + locale.howToList3() + '</li> \
										<li>' + locale.howToList4() + '</li> \
										<li>' + locale.howToList5() + '</li> \
										<li>' + locale.howToList6() + '</li> \
									</ol> \
								</div> \
								<div class="modal-footer"> \
									<button type="button" class="btn btn-default" style="font-family:sayiBulmaca;font-size:18px" data-dismiss="modal"> \
									' + locale.okButton() + '</button> \
								</div> \
							</div> \
						</div> \
					</div>').appendTo(container);
		
		errorModal = $('<div id="errorModalSayiBulmaca_' + getGUID() + '" class="modal fade" role="dialog"> \
				<div class="modal-dialog"> \
					<div class="modal-content"> \
						<div class="modal-header"> \
							<button type="button" class="close" data-dismiss="modal">&times;</button> \
							<h4 class="modal-title" style="font-family:sayiBulmaca;font-size:26px"> \
							' + locale.error() + '</h4> \
						</div> \
						<div class="modal-body" style="font-family:sayiBulmaca;font-size:21px"></div> \
						<div class="modal-footer"> \
							<button type="button" class="btn btn-default" style="font-family:sayiBulmaca;font-size:18px" data-dismiss="modal">\
							' + locale.okButton() + '</button> \
						</div> \
					</div> \
				</div> \
			</div>').appendTo(container);
			
		settingsModal = $('<div id="settingsModalSayiBulmaca_' + getGUID() + '" class="modal fade" role="dialog"> \
				<div class="modal-dialog"> \
					<div class="modal-content"> \
						<div class="modal-header"> \
							<button type="button" class="close" data-dismiss="modal">&times;</button> \
							<h4 class="modal-title" style="font-family:sayiBulmaca;font-size:26px"> \
							' + locale.settingsTitle() + '</h4> \
						</div> \
						<div class="modal-body" style="font-family:sayiBulmaca;font-size:18px"> \
							<h5 style="font-family:sayiBulmaca;font-size:23px">' + locale.excludeZeroSettingTitle() + '</h5> \
							<input type="checkbox" id="exZeroSayiBulmaca_' + getGUID() + '" /> \
							<label for="exZeroSayiBulmaca_' + getGUID() + '">' + locale.excludeZeroSettingText() + '</label> \
							<br /> \
							<h5 style="font-family:sayiBulmaca;font-size:23px">' + locale.languageSettingTitle() + '</h5> \
							<select id="languageSelSayiBulmaca_' + getGUID() + '"></select> \
						</div> \
						<div class="modal-footer"> \
							<button type="button" class="btn btn-default" style="font-family:sayiBulmaca;font-size:18px" data-dismiss="modal">\
							' + locale.cancelButton() + '</button> \
							<button type="button" id="applySettingsSayiBulmaca_' + getGUID() + '" class="btn btn-default" style="font-family:sayiBulmaca;font-size:18px">\
							' + locale.okButton() + '</button> \
						</div> \
					</div> \
				</div> \
			</div>').appendTo(container);
			
		bindHandlers();
	}
	
	function preconfigureSettingsModal() {
		var checkbox = $('#exZeroSayiBulmaca_' + getGUID());
		var langs    = $('#languageSelSayiBulmaca_' + getGUID()).html('');
		
		if(options.excludeZero)
			checkbox.removeAttr('checked');
		else
			checkbox.attr('checked','checked');
		
		var opt = '<option value="default">' + locale.languageSettingText() + '</option>';
		
		for(var i in self.locales) {
			if(self.locales.hasOwnProperty(i)) {
				opt += '<option value="' + i + '">' + self.locales[i].languageName() + '</option>';
			}
		}
		
		langs.html(opt);
	}
	
	function applySettings() {
		var checkbox = $('#exZeroSayiBulmaca_' + getGUID());
		var langs    = $('#languageSelSayiBulmaca_' + getGUID());
		
		options.excludeZero = !checkbox.is(':checked');
		
		if(langs.val() != "default") {
			locale = self.locales[langs.val()];
		}
	}
	
	function err(message, title) {
		if(title == undefined) title = locale.error();
		errorModal.find('.modal-body').html('<p>' + message + '</p>');
		errorModal.find(".modal-title").html(title);
		errorModal.modal('show');
	}
	
	function bindHandlers() {
		var btn = $('#btnSayiBulmaca_' + getGUID());
		var modalBtn = $('#btnYardimSayiBulmaca_' + getGUID());
		var textBox = $('#txtSayiBulmaca_' + getGUID());
		
		
		if(!btn.length) {
			setTimeout(bindHandlers, 100);
			return;
		}
		
		gameButton = btn;
		helpButton = modalBtn;
		gameInput  = textBox;
		userNumberSpan = $('#userNumberSayiBulmaca_' + getGUID());
		
		gameButton.on('click', gameButton_Click);
		
		helpButton.on('click', function() {
			$('#modalSayiBulmaca_' + getGUID()).modal('show');
		});
		
		gameInput.on('keydown', function(e){
			if(e.which==13)
				gameButton_Click();
		});
		
		$('#btnResetSayiBulmaca_' + getGUID()).on('click', function() {
			resetGame();
			mainButtonFlag = true;
			gameButton.html(locale.beginButton());
		});
		
		$('#btnSettingsSayiBulmaca_' + getGUID()).on('click', function() {
			preconfigureSettingsModal();
			settingsModal.modal('show');			
		});
		
		$('#applySettingsSayiBulmaca_' + getGUID()).on('click', function() {
			applySettings();
			settingsModal.modal('hide');
			
			settingsModal.on('hidden.bs.modal', function() {
				init();
			});
		});
	}
	
	function getProbs() {
		return probs;
	}
	
	function getCpuNumber() {
		return cpuNumber;
	}
	
	init();
	
	$.extend(true, window, {SayiBulmaca:SayiBulmaca});
	
	return {
		"version":"0.1",
		"Developer": "Pélagie Birds",
		"Release Date":"28.09.2015",
		
		"init":init(),
		"getProbabilitySet":getProbs,
		"getCpuNumber":getCpuNumber
	}
}

SayiBulmaca.prototype.locales = [];
SayiBulmaca.prototype.locales['en'] = {
	languageName: function () {
		return "English";
	},
	errorInHoldedNumber: function() {
		return "You can't pick this number. Read the help section please.";
	},
	errorInGuessNumber: function () {
		return "Your guess is not satisfying the number picking rules.";
	},
	guessButton: function() {
		return "Guess";
	},
	guessPlaceholder: function() {
		return "Write your guess here.";
	},
	userWinText: function () {
		return "Conguratulations! You win";
	},
	userWinTitle: function () {
		return "Finish";
	},
	cpuWinText: function () {
		return "Computer wins";
	},
	cpuNumber: function () {
		return "Computer picked:";
	},
	cpuWinTitle: function () {
		return "Finish";
	},
	beginButton: function () {
		return "Begin";
	},
	holdNumberPlaceholder: function () {
		return "Pick a number";
	},
	you: function () {
		return "YOU";
	},
	cpu: function () {
		return "COMPUTER";
	},
	guess: function () {
		return "Guess";
	},
	result: function () {
		return "Result";
	},
	howToTitle: function () {
		return "How to Play?";
	},
	howToList1: function () {
		return "Pick a 4-digit number, all digits should be different from each other. (can start with 0)";
	},
	howToList2: function () {
		return "After pressing Begin button try finding computer's number, before it finds yours.";
	},
	howToList3: function () {
		return "By making guesses, you get clues.";
	},
	howToList4: function () {
		return "+n: n digits are at the correct position (step) in computer's number.";
	},
	howToList5: function () {
		return "-n: n digits are at the wrong position (step) in computer's number.";
	},
	howToList6: function () {
		return "0: None of the digits exist in computer's numbers.";
	},
	okButton: function () {
		return "OK";
	},
	cancelButton: function () {
		return "Cancel";
	},
	error: function () {
		return "Error";
	},
	settingsTitle: function () {
		return "Settings";
	},
	excludeZeroSettingTitle: function () {
		return "Picked Number";
	},
	excludeZeroSettingText: function () {
		return "Can include 0";
	},
	languageSettingTitle: function () {
		return "Language";
	},
	languageSettingText: function () {
		return "Choose...";
	}
}