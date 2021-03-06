$(document).ready(function()
{
		setInterval(waiting,1000);
		executeSteps(StepCounter.step);
});

var advanceStep = function(step)
{
	return ++step;
}

var backupFiles = function()
{
	$("#info").append(sprintf('<div>{0} <span class="waiting"></span></div>',message['backup_files']));
	$.get("controller.php","action=BackupFiles").then(function(data)
	{
		clearWaiting();
		if(data.success)
		{
			  $("#info").append(sprintf('<div>{0}</div>',message['backup_success']));
				StepCounter.incrementStep(1);
				executeSteps(StepCounter.step);
		}
		else
		{
			$("#info").append(sprintf('<div>{0}</div>',message['backup_failed']));
		}
	}, failed);
}

var checkForScripts = function()
{
	$("#info").append(sprintf('<div>{0} <span class="waiting"></span></div>',message['check_for_scripts']));
	$.get("controller.php","action=CheckForScripts").then(function(data)
	{
		clearWaiting();
		if(data.exists)
		{
			  $("#info").append(sprintf('<div>{0}</div>',message['scripts_exists']));
				StepCounter.incrementStep(1);
				executeSteps(StepCounter.step);
		}
		else
		{
			$("#info").append(sprintf('<div>{0}</div>',message['no_scripts_exists']));
			StepCounter.incrementStep(2);
			 executeSteps(StepCounter.step);
		}
	}, failed);
}

var checkVersion = function()
{
	var current = false;
	$.get("controller.php","action=VersionIsCurrent").then(function(data)
	{
			clearWaiting();
		  current = data.current;
			if(current)
			{
				$("#info").append(sprintf('<div>'+message['version_up_to_date']+'</div>',data.current_version));
			}
			else
			{
				$("#info").append(sprintf('<div>'+message['version_out_of_date']+'</div>',data.current_version, data.update_version));
				StepCounter.incrementStep(1);
				$("#info").append(sprintf('<div><a href="#" class="primary" onclick="executeSteps(StepCounter.step);">{0}</a></div>',message['update_btn']));
			}
	},
	failed);
}

var checkVersionFileExists = function()
{
	$("#info").append(sprintf('<div>{0} <span class="waiting"></span>',message['check_version_file_exists']));
	$.get('controller.php','action=CheckUpdateFileExists').then(function(data)
	{
		clearWaiting();
		if(data.exists)
		{
			$("#info").append(sprintf('<div>{0}</div>',message['update_file_exists']));
			StepCounter.incrementStep(1);
			executeSteps(StepCounter.step);
		}
		else
		{
			$("#info").append(sprintf(sprintf('<div>{0}</div>',message['update_file_does_not_exist']),data.url));
		}
	},failed);

}

var checkRemoteFiles = function()
{
	$("#info").append(sprintf('<div>{0} <span class="waiting"></span></div>',message['check_remote_files_exist']));
	$.get("controller.php","action=CheckRemoteFilesExist").then(function(data){
		if(data.exists)
		{
			$("#info").append(sprintf('<div>{0}</div>',message['remote_files_exist']));
			StepCounter.incrementStep(1);
			executeSteps(StepCounter.step);
		}
		else
		{
			$("#info").append(sprintf('<div>{0}</div>',message['remote_files_dont_exist']));
		}
	});
}

var checkWritablilty = function()
{
	$("#info").append(sprintf('<div>{0} <span class="waiting"></span>',message['check_files_are_writable']));
	$.get("controller.php","action=CheckFilesAreWritable").then(function(data)
	{
		 if(data.writable)
		 {
			 $("#info").append(sprintf('<div>{0}</div>',message['files_are_writable']));
			 StepCounter.incrementStep(1);
			 executeSteps(StepCounter.step);
		 }
		 else
		 {
		   $("#info").append(sprintf('<div>{0}</div>',message['files_are_not_writable']));
		 }
		 clearWaiting();
	},failed);
}

var clearLinks = function()
{
	$("a").remove();
}

var clearWaiting = function()
{
		$(".waiting").removeClass("waiting");
}

var executeScripts = function()
{
	$("#info").append(sprintf('<div>{0} <span class="waiting"></span>',message['running_scripts']));
	$.get("controller.php","action=ExecuteScripts").then(function(data)
	{
		$("#info").append(sprintf('<div>{0} <span class="waiting"></span>',message['scripts_finished']));
		StepCounter.incrementStep(1);
		executeSteps(StepCounter.step);
	},failed);
}

var executeSteps = function(step)
{
	switch(step)
	{
		case Step.BackupFiles:
			backupFiles();
			break;
		case Step.CheckVersionFileExists:
			checkVersionFileExists();
			break;
		case Step.CheckVersion:
			checkVersion();
			break;
		case Step.CheckWritability:
			 clearLinks();
			 checkWritablilty();
			 break;
		case Step.CheckRemoteFilesExist:
			checkRemoteFiles();
			break;
		case Step.InstallFiles:
			installFiles();
			break;
	 	case Step.UpdateVersion:
			updateVersion();
			break;
		case Step.CheckForScripts:
			checkForScripts();
			break;
		case Step.ExecuteScripts:
			executeScripts();
			break;
		case Step.Finished:
			finished();
			break;
		default:
		  stepNotFound(step);
			break;
	}
}

var failed = function(xhr,status,error)
{
	clearWaiting();
	$("#info").append(sprintf('<div>{0}</div>',message['update_failed']));
	$("#info").append(sprintf('<div>Status: {0}</div>',status));
	$("#info").append(sprintf('<div>Error:  {0}</div>',error));
}

var finished = function()
{
	$("#info").append(sprintf('<div>{0}</div>',message['update_finished']));
}

var installFiles = function()
{
	$("#info").append(sprintf('<div>{0} <span class="waiting"></span></div>',message['installing_files']));
	$.get("controller.php","action=InstallFiles").then(function(data){
			clearWaiting();
			$("#info").append(sprintf('<div>{0}</div>',message['files_installed']));
			StepCounter.incrementStep(1);
			executeSteps(StepCounter.step);
	},failed);
}

var sprintf = function()
{
	 var message = arguments[0];
	 for(var i = 1; i < arguments.length; ++i)
	 {
		 message = message.replace('{'+(i-1)+'}',arguments[i]);
	 }
	 return message;
}

var Step = {
	CheckVersionFileExists : 0,
	CheckVersion: 1,
	CheckWritability: 2,
	CheckRemoteFilesExist: 3,
	BackupFiles: 4,
	InstallFiles: 5,
	CheckForScripts: 6,
	ExecuteScripts: 7,
	UpdateVersion: 8,
	Finished: 9
}

var StepCounter = {
	 step: 0,
	 incrementStep: function(incBy)
	 {
		 this.step += incBy;
	 }
}

var stepNotFound = function(step)
{
	clearLinks();
	$("#info").append(sprintf(sprintf('<div>{0}</div>',message['step_not_found']),step));
}

var updateVersion = function()
{
	$("#info").append(sprintf('<div>{0} <span class="waiting"></span></div>',message['updating_version']));
	$.get("controller.php","action=UpdateVersion").then(function(data){
			clearWaiting();
			$("#info").append(sprintf('<div>{0}</div>',message['version_file_updated']));
			StepCounter.incrementStep(1);
			executeSteps(StepCounter.step);
	},failed);
}

var waiting = function()
{
		$(".waiting").each(function()
    {
    		var dots = $(this).text();
        dots += ".";
        if(dots.length > 3)
        {
          dots = "";
        }
        $(this).text(dots);
    });

}
