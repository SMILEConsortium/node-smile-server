#
# Add license header here
#
NODE = node
JSLINT = jshint
CURL = curl
all:
	./install.sh

lint:
	$(JSLINT) lib/smile/persisteus.js
	$(JSLINT) routes/index.js
	$(JSLINT) smileplug.js
	$(JSLINT) lib/smile/game.js
	$(JSLINT) lib/smile/question.js
	$(JSLINT) lib/smile/student.js
	$(JSLINT) tests/functional/csv.test.js
	$(JSLINT) static/js/smileiqmanager.js
	$(JSLINT) static/js/smilestudent.js

test: 
	@echo "\n == Run All tests minus nada tests=="
	$(NODE) test_all.js

test_all: 
	@echo "\n == Run All tests =="
	$(NODE) test_all.js

smile_init:
	$(CURL) -i -d "{}" -H "Content-Type: application/json" -X PUT http://localhost/smile/sendinitmessage

smile_reset:
	$(CURL) -i -d "{}" -H "Content-Type: application/json" -X PUT http://localhost/smile/reset

smile_startmake:
	$(CURL) -i -d "{}" -H "Content-Type: application/json" -X PUT http://localhost/smile/startmakequestion

smile_startsolve:
	$(CURL) -i -d "{}" -H "Content-Type: application/json" -X PUT http://localhost/smile/startsolvequestion

smile_showresults:
	$(CURL) -i -d "{}" -H "Content-Type: application/json" -X PUT http://localhost/smile/sendshowresults

smile_all:
	$(CURL) -i -X GET http://localhost/smile/all

smile_game_student:
	$(CURL) -i -X GET http://localhost/smile/student
	@echo "\n\n"

smile_results:
	$(CURL) -i -X GET http://localhost/smile/results

server_restart:
	$(CURL) -i -X GET http://localhost/smile/restart

util_echoip:
	$(CURL) -i -X GET http://localhost/smile/echoclientip

clean:
	@echo "\n == Cleaning up ... =="

.PHONY: all
