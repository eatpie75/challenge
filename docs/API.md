API base: /api/1

GET /user_info
* Requires authentication
* No arguments
* User is determined by session
* Returns {'id', first_name', 'last_name', 'email'}


GET /challenge/:id
* Takes one argument: challenge.id
* Returns \<Challenge>

GET /challenge/public
* No arguments
* Returns [\<Challenge>,]

GET /challenge/user
* Requires authentication
* No arguments
* User is determined by session
* Returns [\<Challenge>,] where User is a participant

POST /challenge
* Requires authentication
* POST data: {
*  'title':\<str:min_length=3>, 'message':\<str:min_length=3>,
*  'participants':[{'id':\<int>},],
*  'wager':\<str:optional>, 
* }
* Returns new \<Challenge>

PUT /challenge/:id/started
* Requires authentication
* Takes one argument: challenge.id
* User is determined by session
* User must be challenge creator
* Returns {'success': true}

PUT /challenge/:id/complete
* Requires authentication
* Takes one argument: challenge.id
* User is determined by session
* User must be challenge creator
* Returns {'success': true}

PUT /challenge/:id/accept
* Requires authentication
* Takes one argument: challenge.id
* User is determined by session
* User must be a participant in challenge and not yet accepted
* Returns {'success': true}


        <Challenge> = {
          'id':<int>, 'title':<str>, 'message':<str>, 'url':<str>,
          'creator':<int>, 'started':<bool>, 'complete':<bool>, 'winner'<int>,
          'date_created':<date>, 'date_started':<date>, 'date_completed':<date>,
          'participants':[
              'id':<int>, 'first_name':<str>, 'last_name':<str>,
              'profile_image':<str>, 'accepted':<bool>
          },]
        }
