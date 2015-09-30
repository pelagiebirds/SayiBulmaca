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
	
	function beginRound() { //Başla butonuna basıldığında bu fonksiyon tetiklenir.
		resetGame();
		userNumber=gameInput.val(); //Kullanıcının sayısını hafızaya al.	
		
		if(validNumber(userNumber)) { //Kullanıcının sayısı geçerli bir sayıysa aşağıdakileri yap
			userNumberSpan.html(':&nbsp;' + userNumber);
			cpuNumberAssign();        //Bilgisayar da sayı tutsun
			toggleGuess();            //Tahmin butonunu vs göster
		}else {                       //Kullanıcının sayısı geçersizse aşağıdakileri yap
			err(locale.errorInHoldedNumber()); //Uyarı ver
			userNumber="";                               //Hafızada tutulan kullanıcı sayısını sil
		}
	}
	
	function validNumber(number) {  //Tutulan sayının geçerli olup olmadığını test eden fonksiyon	
		if(number.length!=4) return false; //Eğer 4 haneli değilse geçersiz
		
		for(var i=0;i<4;i++) {
			if(number[i]!=parseInt(number[i])) return false; //Eğer harf vs girildiyse geçersiz
		}
		
		for(var i=0;i<4;i++) {
			for(var j=0;j<4;j++) {
				if(i!=j&&number[i]==number[j]) return false; //Eğer herhangi bir rakam bir diğeriyle aynıysa geçersiz
			}
		}
		
		if(options.excludeZero) { //Tutulan sayıda 0 olamayacaksa
			if(number.indexOf("0")>-1) {
				return false; //Sayıda 0 varsa geçersiz
			}
		}
		
		return true; //Yukarıdaki her şartı sağlıyorsa geçerli
	}
	
	function cpuNumberAssign() { //Bilgisayar sayı tutsun
		cpuNumber=""; //Hafızayı boşalt
		cpuNumber=rnd(); //Öncelikle rnd() fonksiyonuyla rastgele bir rakam seçilsin
		
		while(cpuNumber.length!=4) { //Bilgisayarın sayısı 4 haneli olana kadar aşağıdakileri yap
			var aday=rnd(); //Yeni bir rastgele sayı adayı üret
			var ekle=true;  
			
			for(var i=0;i<cpuNumber.length;i++) {
				if(cpuNumber[i]==aday) ekle=false; //Aday rakam daha önce sayıda varsa ekleme
			}
			
			if(ekle) cpuNumber+=''+aday; //Eğer ekle değişkeni hala doğru(true) ise adayı ekle
		}
		
		if(!validNumber(cpuNumber)) { //Eğer bilgisayarın sayısı geçersizse (her ihtimale karşı) bütün işlemleri tekrar yap
			cpuNumberAssign();
		}else { //Değilse aşağıdakini yap
			populateProbs(); //Bu fonksiyon aşağıda anlatılıyor
		}
		
		return;
	}
	
	function toggleGuess() {
		gameButton.html(locale.guessButton());
		gameInput.attr('placeholder', locale.guessPlaceholder());
		gameInput.val('');
		mainButtonFlag = false;
	}
	
	function rnd() { //Rastgele rakam üreten fonksiyon
		var _rand = Math.floor(Math.random()*10); //Matematiksel ve JavaScriptsel zırvalar...
		
		if(options.excludeZero) { //Sayıda 0 olmayacaksa
				while(_rand == 0) { //Bilgisayarın tuttuğu sayıda da 0 olamaz
					_rand = Math.floor(Math.random()*10);
				}
		}
		
		return _rand; 
	}
	
	function randomGuess() { //Tüm olasılıklar kümesinden rastgele bir tercih yapmaya yaran fonksiyon
		var elms = probs.length-1; //Kümede hali hazırda kaç eleman varsa işte...
		
		var rand  = Math.random();
		var i=0;
		
		while(rand>1/elms) {
			rand-=1/elms;
			i++;
		}
		
		return probs[i]; //Rastgele tahmini aktar
	}
	
	function populateProbs() { //Tüm olası sayı kümesini üreten fonksiyon
		var eleman="";
		var _startFrom = options.excludeZero ? 1 : 0; //Sayıda 0 olmayacaksa 1'den, olacaksa 0'dan başla
		
		for(var i=_startFrom;i<10;i++) { //0'dan 10'a kadar birer birer arttır i'yi
			for(var j=_startFrom;j<10;j++) {//Aynısı j için de...
				if(i!=j) { //i j'ye eşit değilse (rakamlar tekrar edemez)
					for(var k=_startFrom;k<10;k++) { //k'yi de 0'dan 10'a kadar artır
						if(k!=i&&k!=j) { //Hiçbir rakam eşit değilse
							for(var l=_startFrom;l<10;l++) { //l'yi de 0'dan 10'a...
								if(l!=k&&l!=j&&l!=i) { //Hâlâ hiçbir rakam eşit değilse bunlardan bir sayı üret
									eleman=i+''+j+''+k+''+l; //İlk sayı mesela 0123, böyle böyle üretiliyor tüm küme
									probs.push(eleman); //Kümeye ekle bu elemanı
								}
							}
						}
					}
				}
			}
		}
	}
	
	function validGuess(number) { //Bu fonksyion tahminlerin geçerli olup olmadığını kontrol etmek için var
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

	function evalGuess(guess, num) { //Yapılan tahminleri tutulan sayılara bakarak değerlendr ve +x -x filan de
	//Çok amelelik var, bakarak ne kadar anlarsan artık :)
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

	function userGuess() { //Kullanıcı bir tahminde bulunursa
		var guess=gameInput.val();
		
		gameInput.val('').focus();
		
		if(validGuess(guess)) { //Tahmin geçerli/tutarlı bir tahminse
			var result = evalGuess(guess,cpuNumber); //Bilgisayarın sayısına bakarak değerlendirme yap
			var hg     = $("#hgSayiBulmaca_" + getGUID());
			var hr     = $("#hrSayiBulmaca_" + getGUID());
			
			hg.html(hg.html() + guess + '<br />');
			hr.html(hr.html() + result.text + '<br />');
			
			if(result.arti==4) { //Sonuç +4 ise insan kazandı!
				endGame(1);
			}else { //Değilse bilgisayarda sıra
				cpuGuess(); //Bilgisayar insanın sayısını tahmin etsin
			}
		}else { //Tahmin tutarlı/geçerli değilse
			err(locale.errorInGuessNumber());
		}
		
		return;
	}

	function cpuGuess() { //Bilgisayar tahmin fonk.
		if(probs.length!=1) { //Olasılıklar kümesinde yalnızca tek bir eleman kalmadıysa
			var temp=[]; //Geçici bir hafıza aç
			var guess=randomGuess(); //Kümeden rastgele bir eleman seç
			var result=evalGuess(guess, userNumber); //Kullanıcının sayısıyla tahmini karşılaştır (+n -m gibi bir sonuç gelecek)
			var plus=result.arti, minus=result.eksi;
			
			probs.forEach(function(value){ //Tüm olasılıklar kümesindeki her eleman için:
				var res=evalGuess(guess, value); //Tahminle elemanı karşılaştır
				
				if(res.arti==plus&&res.eksi==minus) temp.push(value); //Eğer o eleman +n -m ise geçici hafızaya onu da ekle
			});
			
			//Yukarıdaki işlem sayesinde kullanıcının hangi sayıları "tutmadığını" öğreniyoruz. Tüm olasılıklar kümesinde
			//tek eleman kalıncaya kadar oyun devam edecek. En nihayetinde bilgisayar da sayıyı bilecek.	
			probs = temp.slice(); //Geçici hafızadaki tüm elemanları tüm olasılıklar kümesine aktar

			var cg     = $("#cgSayiBulmaca_" + getGUID());
			var cr     = $("#crSayiBulmaca_" + getGUID());
			
			cg.html(cg.html() + guess + '<br />');
			cr.html(cr.html() + result.text + '<br />');
			
			if(plus==4) { //Eğer bilgisayar +4 bulduysa o kazandı
				endGame(2);
			}else { //Yoksa devam et
				toggleGuess();
			}		
		}else { //Tüm olasılıklar kümesinde tek eleman kaldıysa bilgisayar kesin olarak bilmiş demektir.
			var guess=probs[0];
			var result=evalGuess(guess, userNumber);		
			var cg     = $("#cgSayiBulmaca_" + getGUID());
			var cr     = $("#crSayiBulmaca_" + getGUID());
			
			cg.html(cg.html() + guess + '<br />');
			cr.html(cr.html() + result.text + '<br />');
			endGame(2);
		}
	}

	function endGame(who) { //Oyunun bittiğini bildir
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
SayiBulmaca.prototype.locales['tr'] = {
	languageName: function () {
		return "Türkçe";
	},
	errorInHoldedNumber: function() {
		return "Kurallara aykırı bir sayı tuttunuz.";
	},
	errorInGuessNumber: function () {
		return "Kurallara aykırı bir tahmin yaptınız.";
	},
	guessButton: function() {
		return "Tahmin";
	},
	guessPlaceholder: function() {
		return "Tahmininizi yazınız";
	},
	userWinText: function () {
		return "Tebrikler! Kazandınız";
	},
	userWinTitle: function () {
		return "Bitti";
	},
	cpuWinText: function () {
		return "Bilgisayar kazandı";
	},
	cpuNumber: function () {
		return "Bilgisayarın tuttuğu sayı:";
	},
	cpuWinTitle: function () {
		return "Bitti";
	},
	beginButton: function () {
		return "Başla";
	},
	holdNumberPlaceholder: function () {
		return "Tuttuğunuz sayıyı yazınız";
	},
	you: function () {
		return "SİZ";
	},
	cpu: function () {
		return "BİLGİSAYAR";
	},
	guess: function () {
		return "Tahmin";
	},
	result: function () {
		return "Sonuç";
	},
	howToTitle: function () {
		return "Nasıl Oynanır?";
	},
	howToList1: function () {
		return "Rakamları birbirinden farklı 4 basamaklı bir sayı tutun. (0 ile başlayabilir)";
	},
	howToList2: function () {
		return "Oyunu başlattıktan sonra bilgisayarın tuttuğu sayıyı bulmaya çalışın, o sizinkini bulmadan önce.";
	},
	howToList3: function () {
		return "Her tahminizden sonra bir ipucu elde edersiniz.";
	},
	howToList4: function () {
		return "+n: Tahmininizdeki n adet rakam tutulan sayıda var ve doğru basamakta demektir.";
	},
	howToList5: function () {
		return "-n: Tahmininizdeki n adet rakam tutulan sayıda var ve yanlış basamakta demektir.";
	},
	howToList6: function () {
		return "0: Tahmininizdeki hiçbir rakam tutulan sayıda yok demektir.";
	},
	okButton: function () {
		return "Tamam";
	},
	cancelButton: function () {
		return "İptal";
	},
	error: function () {
		return "Hata";
	},
	settingsTitle: function () {
		return "Ayarlar";
	},
	excludeZeroSettingTitle: function () {
		return "Tutulan Sayıda 0";
	},
	excludeZeroSettingText: function () {
		return "Olabilsin";
	},
	languageSettingTitle: function () {
		return "Dil";
	},
	languageSettingText: function () {
		return "Dil Seçin...";
	}
}