[app]
title = AI Trainer
package.name = aitrainer
package.domain = org.isireel

source.dir = src/kivy
source.include_exts = py,png,jpg,kv,atlas,json

version = 1.0.0

requirements = python3,kivy,kivymd,plyer,requests,python-dotenv,ai_trainer

orientation = portrait
fullscreen = 0

ios.kivy_ios_url = https://github.com/kivy/kivy-ios
ios.kivy_ios_branch = master
ios.ios_deploy_url = https://github.com/phonegap/ios-deploy
ios.ios_deploy_branch = 1.12.2

[buildozer]
log_level = 2
warn_on_root = 1

# iOS specific
ios.codesign.allowed = false
