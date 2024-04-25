(function($) {

	"use strict";

	var fullHeight = function() {

		$('.js-fullheight').css('height', $(window).height());
		$(window).resize(function(){
			$('.js-fullheight').css('height', $(window).height());
		});

	};
	fullHeight();

	$('#sidebarCollapse').on('click', function () {
      $('#sidebar').toggleClass('active');
  });

})(jQuery);


//------------------- Statrt Daynamic Chat App Script -------------

function getCookie(name) {
	let matches = document.cookie.match(new RegExp(
		"(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
	));
	return matches ? decodeURIComponent(matches[1]) : undefined;
}

var userData=JSON.parse(getCookie('user'));

console.log('Cookie Data', userData);

var sender_id=userData._id

var receiver_id;

var socket = io('/user-namespace', {
	auth: {
		token: userData._id
	}
});



$(document).ready(function() {
	// Event handler for clicking on a user
	$('.user-list').click(function() {
		var userId = $(this).data('id');
		sender_id = '<%= user._id %>'; // Set sender_id
		receiver_id = userId;

		$('.start-head').hide();
		$('.chat-section').show();
		$('.user-list').removeClass('active-user');
		$(this).addClass('active-user');

		// Emit existsChat event to load old chats
		socket.emit('existsChat', { sender_id: sender_id, receiver_id: receiver_id });
	});
});

// Update user online status
socket.on('getOnlineUser', function(data) {
	$('#' + data.user_id + '-status').text('Online');
	$('#' + data.user_id + '-status').removeClass('offline-status').addClass('online-status');
});

// Update user offline status
socket.on('getOfflineUser', function(data) {
	$('#' + data.user_id + '-status').text('Offline');
	$('#' + data.user_id + '-status').addClass('offline-status').removeClass('online-status');
});

// Save chat function
$('#chat-form').submit(function(event) {
	event.preventDefault();

	var message = $('#message').val();

	// Use sender_id and receiver_id here
	$.ajax({
		url: '/save-chat',
		type: 'POST',
		data: {
			sender_id: sender_id,
			receiver_id: receiver_id,
			message: message 
		},
		success: function(response) {
			if (response.success) {
				console.log(response.data.message);
				$('#message').val('');
				let chat = response.data.message;
				let html = `
					<div class="current-user-chat" id='`+response.data._id+`' >
						<h5> <span>`+chat+`</span>
							<i class="fa fa-trash" aria-hidden="true" data-id='`+response.data._id+`' data-toggle="modal" data-target="#deleteChatModal"></i>  
							<i class="fas fa-edit" aria-hidden="true" data-id='`+response.data._id+`' data-msg='`+chat+`' data-toggle="modal" data-target="#editChatModal"></i>

							
							</h5>
					</div>
				`; 
				// Append the chat message to the chat container
				$('#chat-container').append(html);
				
				// Emit new chat event to the server
				socket.emit('newChat', response.data);

				scrollChat();
				
			} else {
				alert(response.msg); // Corrected typo in alert message
			}
		}
	});
});

// Socket event for receiving new chat messages
socket.on('loadNewChat', function(data) {
	if(sender_id == data.receiver_id && receiver_id == data.sender_id){
		let html = `
		<div class="distance-user-chat" id='`+data._id+`'>
			<h5><span> +data.message </span>
				
				</h5>
		</div>
	`; 
	$('#chat-container').append(html);
	}

});

// Socket event for loading old chats
socket.on('loadChats', function(data){
	$('#chat-container').html('');

	var chats = data.chats;

	let html = '';
	for(let x = 0; x < chats.length; x++){
		let addClass = '';
		if(chats[x]['sender_id'] == sender_id) {
			addClass = 'current-user-chat';
		} else {
			addClass = 'distance-user-chat';
		}
		html += `
		<div class="${addClass}" id='${chats[x]._id}'>
			<h5>
				<span>${chats[x]['message']}</span>
				${chats[x]['sender_id'] == sender_id ? `
					<i class="fa fa-trash" aria-hidden="true" data-id='${chats[x]._id}' data-toggle="modal" data-target="#deleteChatModal"></i>
					<i class="fas fa-edit" aria-hidden="true" data-id='${chats[x]._id}' data-msg='${chats[x]['message']}' data-toggle="modal" data-target="#editChatModal"></i>
				` : ''}
			</h5>
		</div>
		`;
	}
	$('#chat-container').append(html);
	scrollChat();
});

function scrollChat(){
	$('#chat-container').animate({
		scrollTop:$('#chat-container').offset().top+$('#chat-container')[0].scrollHeight
	},0)
}

// Delete Chats

$(document).on('click', '.fa-trash', function() {

let msg=$(this).parent().text();
$('#delete-message').text(msg);
$('#delete-message-id').val($(this).attr('data-id'));
});

$('#delete-chat-form').submit(function(event) {
	event.preventDefault(); // Prevent form submission

	var id=$('#delete-message-id').val();

	$.ajax({
		url:'/delete-chat',
		type:'POST',
		data:{id:id},
		success:function(res){
			if(res.success == true){
				$('#'+id).remove();
				$('#deleteChatModal').modal('hide')
				socket.emit('chatDeleted' , id)
			}
			else{
				alert(res.msg)
			}
		}
	})

});

socket.on('chatMessageDelete', function(id){
	$('#'+id).remove();
})

// update message post

$(document).on('click', '.fa-edit', function(){
	var id = $(this).attr('data-id');
	var message = $(this).attr('data-msg');
	$('#edit-message-id').val(id);
	$('#update-message').val(message);
});
//update message post

$('#update-chat-form').submit(function(event) 
{
	event.preventDefault(); // Prevent form submission

	var id=$('#edit-message-id').val();
	var msg=$('#update-message').val();

	$.ajax({
		url:'/update-chat',
		type:'POST',
		data:{id:id,message:msg },
		success:function(res){
			if(res.success == true){
				
				$('#editChatModal').modal('hide')
				$('#'+id).find('span').text(msg);
				$('#'+id).find('.fa-edit').attr('data-msg',msg);
				socket.emit('chatUpdated' , {id:id, message:msg})
			}
			else{
				alert(res.msg)
			}
		}
	})

});

socket.on('chatMessageUpdated', function(data)
{
	$('#'+data.id).find('span').text(data.message);
})

// Socket connection event
socket.on('connect', function() {
	console.log('Connected to the server');
});

// Socket disconnection event
socket.on('disconnect', function() {
	console.log('Disconnected from the server');
});






