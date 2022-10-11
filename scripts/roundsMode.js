/*************************************************************************
 * File: roundsMode.js
 * This file contains functions that support the "Rounds" mode, 
 * including the "Log Round" modal.
*************************************************************************/

/*************************************************************************
 * @function updateSGS 
 * @Desc 
 * When the strokes, minutes or seconds fields are updated, 
 * update the speedgolf score accordingly.
 * @global roundStrokes: Form's strokes field
 * @global roundMinutes: Form's minutes field
 * @global roundSeconds: Form's seconds field
 *************************************************************************/
function updateSGS() {
    GlobalRoundSGS.value = 
      (GlobalRoundStrokes.valueAsNumber + GlobalRoundMinutes.valueAsNumber) + 
      ":" + GlobalRoundSeconds.value
}

/*************************************************************************
 * @function changeSeconds 
 * @Desc 
 * When the seconds field is updated, we need to ensure that the
 * seconds field of the round time is zero-padded. We also need to 
 * call updateSGS to update the speedgolf score based on the new seconds value.
 * @global roundStrokes: Form's strokes field
 * @global roundMinutes: Form's minutes field
 * @global roundSeconds: Form's seconds field
 *************************************************************************/
function changeSeconds() {
    if (GlobalRoundSeconds.value.length < 2) {
      GlobalRoundSeconds.value = "0" + GlobalRoundSeconds.value;
    }
    updateSGS();
}

/*************************************************************************
 * @function prepLogRoundForm 
 * @desc 
 * Prepares the round form to log a new round by setting the header text
 * and button label to "Log Round," and by setting the button's icon
 * @global GlobalRoundFormHeader: Form's H1 element
 * @global GlobalRoundFormSubmitBtnLabel: Form's button label
 * @global GlobalRoundFormSubmitBtnIcon: Form's button icon
 *************************************************************************/
function prepLogRoundForm() {
    GlobalRoundFormHeader.textContent = "Add Round";
    GlobalRoundFormSubmitBtnLabel.innerHTML = "&nbsp;Add Round";
    if (GlobalRoundFormSubmitBtnIcon.classList.contains("fa-edit")) {
      GlobalRoundFormSubmitBtnIcon.classList.remove("fa-edit");
    }
    if (!GlobalRoundFormSubmitBtnIcon.classList.contains("fa-save")) {
      GlobalRoundFormSubmitBtnIcon.classList.add("fa-save");
    }
  }

 

  /*************************************************************************
 * @function resetLogRoundForm 
 * @Desc 
 * When the user exits the "Log Round" Dialog, reset the form to
 * show blank data and default values
 * @global roundDate: Form's date field
 * @global roundCourse: Form's course field
 * @global roundType: Form's type field
 * @global roundStrokes: Form's strokes field
 * @global roundMinutes: Form's minutes field
 * @global roundSeconds: Form's seconds field
 * @global roundSGS: Form's Speedgolf Score field
 * @global roundNotes: Form's notes field
 * @global roundsErrBox: <div> containing the error messages
 * @global roundCourseErr: Error message for course field
 * @global roundStrokesErr: Error message for strokes field
 * @global roundMinutesErr: Error message for minutes field
 * @global roundSecondsErr: Error message for seconds  field
 * @global roundNotesErr: Error message for notes field
 *************************************************************************/
function resetLogRoundForm() {
  //Set date to today.
  GlobalRoundDate.valueAsNumber =
    Date.now()-(new Date()).getTimezoneOffset()*60000;
  GlobalRoundCourse.value = "";
  GlobalRoundType.value = "practice";
  GlobalRoundHoles.value = "18";
  GlobalRoundStrokes.value = "80";
  GlobalRoundMinutes.value = "60";
  GlobalRoundSeconds.value = "00";
  GlobalRoundSGS.value = "140:00";
  GlobalRoundNotes.value = "";
  GlobalRoundDateErr.classList.add("hidden");
  GlobalRoundCourseErr.classList.add("hidden");
  GlobalRoundStrokesErr.classList.add("hidden");
  GlobalRoundMinutesErr.classList.add("hidden");
  GlobalRoundSecondsErr.classList.add("hidden");
  GlobalRoundNotesErr.classList.add("hidden");
  GlobalRoundErrBox.classList.add("hidden");
  GlobalFirstFocusableLogRoundItem.set(GlobalRoundDate);
}

/*************************************************************************
* @function roundUpdatedClose CLICK Handler 
* @desc 
* When the user clicks on the close button of the "Round Logged"
* toast notification on the "Rounds" mode page, close it.
* @global roundLogged: The "Round Logged" toast
*************************************************************************/
GlobalRoundUpdatedClose.addEventListener("click",function() {
  GlobalRoundUpdated.classList.add("hidden");
});

/*************************************************************************
* @function logRound 
* @desc 
* Build a JavaScript object containing a new round data, save the
* round to localStorage, update the "Rounds"table, return the user to 
* "Rounds" mode page, and display a toast message indicating that a 
* new round was logged.
* @global GlobalLoginPage: The "Log In" page
* @global GlobalRoundDate: The date field in "Log Round" form
* @global GlobalRoundCourse: The course field in "Log Round" form
* @global GlobalRoundType: The type field in "Log Round" form
* @global GlobalRoundHoles: The holes field in "Log Round" form
* @global GlobalRoundStrokes: The strokes field in "Log Round" form
* @global GlobalRoundMinutes: The minutes field in "Log Round" form
* @global GlobalRoundSeconds: The seconds field in "Log Round" form
* @global GlobalRoundMinutes: The minutes field in "Log Round" form
* @global GlobalRoundSGS: The SGS field in "Log Round" form
* @global GlobalRoundNotes: The round updated toast notification
* @global GlobalRoundUpdatedMsg: Reference to notification toast
* @global GlobalRoundUpdatedMsg: The message field of the round updated toast
*************************************************************************/
function logRound() {
  //Create new object with form data
  const newRound = {
    date: GlobalRoundDate.value,
    course: GlobalRoundCourse.value,
    type: GlobalRoundType.value,
    holes: GlobalRoundHoles.value,
    strokes: GlobalRoundStrokes.value,
    minutes: GlobalRoundMinutes.value,
    seconds: GlobalRoundSeconds.value,
    SGS: GlobalRoundSGS.value,
    notes: GlobalRoundNotes.value,
    roundNum: ++(GlobalUserData.roundCount)
  };
  //Push round object to end of rounds array
  GlobalUserData.rounds.push(newRound);
  //Save to local storage
  localStorage.setItem(GlobalUserData.accountInfo.email,
    JSON.stringify(GlobalUserData));
  //Reset form to prepare for next visit
  resetLogRoundForm();
  //Add new round to table
  addRoundToTable(GlobalUserData.rounds.length-1)
  //Transition back to mode page
  GlobalRoundUpdatedMsg.textContent = "New Round Logged!";
  GlobalRoundUpdated.classList.remove("hidden");
  transitionFromDialog(GlobalRoundsModeDialog);
}

/*************************************************************************
* @function logRoundForm SUBMIT Handler 
* @Desc 
* When the user clicks on the "Add Round" button, we first check the
* validity of the fields, presenting accessible
* error notifications if errors exist. If no errors exist, we
* call the logRound() function, passing in the round data
* @global createAccountForm: the <form> element whose 
*         SUBMIT handler is triggered
* @global GlobalRoundDate, the field containing the round date
* @global GlobalRoundCourse, the course of the round
* @global GlobalRoundStrokes, the number of strokes taken in the round
* @global GlobalRoundMinutes, the number of minutes taken in the round
* @global GlobalRoundSeconds, the number of seconds taken in teh round
* @global GlobalRoundNotes, the notes on the round
*************************************************************************/
GlobalLogRoundForm.addEventListener("submit",function(e) {
  e.preventDefault(); //Prevent default submit behavior
  //Is the date valid?
  let dateValid = !GlobalRoundDate.validity.valueMissing;
  //Is the course field valid?
  let courseValid = !GlobalRoundCourse.validity.tooLong && 
                    !GlobalRoundCourse.validity.valueMissing;
  //Is the password field valid?
  let strokesValid = !GlobalRoundStrokes.validity.typeMismatch &&
                     !GlobalRoundStrokes.validity.rangeUnderflow &&
                     !GlobalRoundStrokes.validity.rangeOverflow && 
                     !GlobalRoundStrokes.validity.valueMissing;
  //Is the minutes field valid?
  let minutesValid = !GlobalRoundMinutes.validity.typeMismatch &&
                     !GlobalRoundMinutes.validity.rangeUnderflow &&
                     !GlobalRoundMinutes.validity.rangeOverflow && 
                     !GlobalRoundMinutes.validity.valueMissing;
  //Is the seconds field valid?
  let secondsValid = !GlobalRoundSeconds.validity.typeMismatch &&
                     !GlobalRoundSeconds.validity.rangeUnderflow &&
                     !GlobalRoundSeconds.validity.rangeOverflow && 
                     !GlobalRoundSeconds.validity.valueMissing;
  //Is the notes field valid?
  let notesValid = !GlobalRoundNotes.validity.tooLong;
  if (courseValid && strokesValid && minutesValid &&
      secondsValid && notesValid &&dateValid) { 
      //All is well -- log round or update round
     logRound();
     return;
  }
  //If here, at least one field is invalid: Display the errors
  //and allow user to fix them.
  GlobalRoundErrBox.classList.remove("hidden");
  document.title = "Error: Log Round";
  if (!notesValid) { 
    GlobalRound.classList.remove("hidden");
    GlobalRoundNotesErr.focus();
    GlobalFirstFocusableLogRoundItem.set(GlobalRoundNotesErr);
  } else {
    GlobalRoundNotesErr.classList.add("hidden");
  }
  if (!secondsValid) { 
    GlobalRoundSecondsErr.classList.remove("hidden");
    GlobalRoundSecondsErr.focus();
    GlobalFirstFocusableLogRoundItem.set(GlobalRoundSecondsErr);
  } else {
    GlobalRoundSecondsErr.classList.add("hidden");
  }
  if (!minutesValid) { 
    GlobalRoundMinutesErr.classList.remove("hidden");
    GlobalRoundMinutesErr.focus();
    GlobalFrstFocusableLogRoundItem.set(GlobalRoundMinutesErr);
  } else {
    GlobalRoundMinutesErr.classList.add("hidden");
  }
  if (!strokesValid) { 
    GlobalRoundStrokesErr.classList.remove("hidden");
    GlobalRoundStrokesErr.focus();
    GlobalFirstFocusableLogRoundItem.set(GlobalRoundStrokesErr);
  } else {
    GlobalRoundStrokesErr.classList.add("hidden");
  }
  if (!courseValid) { 
      GlobalRoundCourseErr.classList.remove("hidden");
      GlobalRoundCourseErr.focus();
      GlobalFirstFocusableLogRoundItem.set(GlobalRoundCourseErr);
  } else {
      GlobalRoundCourseErr.classList.add("hidden");
  }
  if (!dateValid) { 
    GlobalRoundDateErr.classList.remove("hidden");
    GlobalRoundDateErr.focus();
    GlobalFirstFocusableLogRoundItem.set(GlobalRoundDateErr);
} else {
    GlobalRoundDateErr.classList.add("hidden");
}
});

/*************************************************************************
* @function addRoundToTable 
* @desc 
* Adds a new round to the "Rounds" table.
* After adding a row to the table, calls writeRoundToTable() to write data.
* @param roundIndex: index in userData.rounds of round to add
* @global GlobalUserData: the current user's data object
*************************************************************************/
function addRoundToTable(roundIndex) {
    const roundId = GlobalUserData.rounds[roundIndex].roundNum;
    if (GlobalRoundsTable.rows[1].innerHTML.includes ("colspan")) {
      //empty table! Remove this row before adding new one
      GlobalRoundsTable.deleteRow(1);
    }
    //Write new row containing new round to table body
    const thisRoundBody = GlobalRoundsTable.querySelector("tbody");
    const thisRound = thisRoundBody.insertRow(0); //insert as first table row
    thisRound.id = "r-" + roundId; //set unique id of  row so we can access it later
    thisRound.innerHTML = "<td>" + GlobalUserData.rounds[roundIndex].date + "</td><td>" +
      GlobalUserData.rounds[roundIndex].course + "</td><td>" + 
      GlobalUserData.rounds[roundIndex].SGS + " (" + GlobalUserData.rounds[roundIndex].strokes +
      " in " + GlobalUserData.rounds[roundIndex].minutes + ":" + 
      GlobalUserData.rounds[roundIndex].seconds + 
      ")</td>" +
      "<td><button aria-label='View and Edit Round'" + 
      "onclick='editRound(" + roundId + ")'><span class='fas fa-eye'>" +
      "</span>&nbsp;<span class='fas fa-edit'></span></button></td>" +
      "<td><button aria-label='Delete Round'" + 
      "onclick='confirmDelete(" + roundId + ")'>" +
      "<span class='fas fa-trash'></span></button></td>";
}
  

/*************************************************************************
* @function keyDownRoundDialogFocused 
* @desc 
* When the user presses a key with an element in the Log Round 
* dialog focused, we implement the accessible keyboard interface for
* a modal dialog box. This means that "Escape" dismisses the dialog and
* that it is impossible to tab outside of the dialog box.
* @global GlobalFirstFocusableLogRoundItem: References the first focusable
*         item in "Log Round" dialog. 
* @global GlobalRoundsModeLogCancelBtn: The "Cancel" button (last focusable 
*         item in "Log Round" dialog)
*************************************************************************/
function keyDownRoundDialogFocused(e) {
  if (e.code === "Escape") {
    GlobalRoundsModeLogCancelBtn.click();
    return;
  }
  if (e.code === "Tab" && document.activeElement == GlobalFirstFocusableLogRoundItem.get() &&
     e.shiftKey) {
      //shift focus to last focusable item in dialog
      GlobalRoundsModeLogCancelBtn.focus();
      e.preventDefault();
      return;
  }
  if (e.code === "Tab" && document.activeElement == GlobalRoundsModeLogCancelBtn &&
      !e.shiftKey) {
      //shift focus to first focusable item in dialog
      GlobalFirstFocusableLogRoundItem.get().focus();
      e.preventDefault();
      return;
  }
}