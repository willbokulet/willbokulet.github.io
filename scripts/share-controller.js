//share-controller.js

(function (){
	'use strict';
	
angular
.module('myApp', [])

// controller here
.controller('share_controller', share_controller );
	
	function share_controller() {
		var vm = this;
		
		vm.shares = [{
			Items: "Valk Mant[1], Valk Armor[1], Valk Shoes[1], Helm[1]",
			Members: "Willbo, Kabo, Deance, Mie, Jess",
			Seller: "Deance",
			Raid_Date: new Date(),
			Status: "Closed",
			Closed_Date: new Date()
		},
		{
			Items: "D. Robe, D. Shoes, D. Mant",
			Members: "Ellie, Ethan, Ace, Jaja, Myk",
			Seller: "Ellie",
			Raid_Date: new Date(),
			Status: "Open",
			Closed_Date: new Date()
		},
		{
			Items: "Lots of Jellopy",
			Members: "Lucio, Chi, Ice, Vibe, Mongo, NANA",
			Seller: "Ice",
			Raid_Date: new Date(),
			Status: "Open",
			Closed_Date: new Date()
		}];
		
		vm.newShares = {};
		
		vm.addShares = function (){
			vm.shares.push({
				Items: vm.newShares.Items,
				Members: vm.newShares.Members,
				Seller: vm.newShares.Seller,
				Raid_Date: new Date(),
				Status: "Open",
				Closed_Date: new Date()
			});
		};
		
		vm.saveToFirebase = function () {
		    var emailObject = {
			email: vm.newShares.Items
		    };

		    firebase.database().ref('subscription-entries').push().set(emailObject)
			.then(function(snapshot) {
			    success(); // some success method
			}, function(error) {
			    console.log('error' + error);
			    error(); // some error method
			});
		}
	}
})();
