//Let's declare a global var Q so that other modules can find it.
var Q;

/*export $q2k */
var $q2k = (function(){

	/**
	* IMPORTANT: From "[Mobile|Tablet]>Properties>App Events>Post Appinit" add
	* a snippet with a call to this function to your app's post-appinit event.
	*/
	function bootstrap(){
		Q = kony.Q;
		Q.longStackSupport = true;
	}

	//TODO: Break this file into several modules, one for each function.
	/**
	* Animate Kony widgets in a promisy way -e.g:
	*
	* 	$q2k.animate(widget, steps, config)
	*		.progress(function(t){
	*			//Use t.widget, t.animationHandle, t.elapsedTime
	*		})
	*		.then(function(t){
	*			//Use t.widget, t.animationHandle, t.elapsedTime
	*		})
	*		.fail(function(error){
	*			//Log or notify the error.
	*		});
	*/
	function animate(widget, steps, config){

		return Q.Promise(function(resolve, reject, notify) {

			function onAnimationStart(widget, animationHandle, elapsedTime) {
				notify({
					'widget': widget,
					'animationHandle': animationHandle,
					'elapsedTime': elapsedTime
				});
			}

			function onAnimationEnd(widget, animationHandle, elapsedTime) {
				resolve({
					'widget': widget,
					'animationHandle': animationHandle,
					'elapsedTime': elapsedTime
				});
			}

			var callbacks = {
				animationStart: onAnimationStart,
				animationEnd: onAnimationEnd
			};

			try{
				var animation = kony.ui.createAnimation(steps);
				widget.animate(animation, config, callbacks);
			}
			catch(e){
				reject(new Error(
					`Problem animating widget ${widget.id}:\n\t${e}`
				));
			}
		});
	}

	function init(appKey, appSecret, serviceUrl){

		return Q.Promise(function(resolve, reject, /*notify*/) {

			var client = new kony.sdk();
			client.init(appKey, appSecret, serviceUrl, function(/*config*/){
				resolve(client);
			}, function(e){
				reject({message: 'Could not initialize an instance of the Fabric client/sdk for\n\t' +
						`key: ${appKey}\n\t` +
						`secret: ${appSecret.substring(appSecret.length - 4)}` +
						`error: ${JSON.stringify(e)}`
				});
			});
		});
	}

	function invoke(client, serviceName, operationName, headers, data, options){

		return Q.Promise(function(resolve, reject/*, notify*/) {

			function onSuccess(response){
				if(response.opstatus === 0 || response.opstatus === "0"){
					resolve(response);
				}
				else{
					reject(response);
				}
			}

			function onFailure(error){
				reject(error);
			}

			try{
				var service = client.getIntegrationService(serviceName);
				service.invokeOperation(operationName, headers, data, onSuccess, onFailure, options);
			}
			catch(e){
				reject({message: `Could not find or call ${serviceName}.${operationName}:\n\t${e}`});
			}
		});
	}

	function setCurrentTheme(theme){
		return Q.Promise(function(resolve, reject/*, notify*/) {
			kony.theme.setCurrentTheme(
				theme,
				function () {
					resolve();
				},
				function (code, message) {
					reject(new Error(`code ${code}:${message}`));
				}
			);
		});
	}

	return {
		bootstrap: bootstrap,
		animate: animate,
		fabric: {
			init: init,
			invoke: invoke
		},
		theme: {
			setCurrentTheme: setCurrentTheme
		}
	};

})();
