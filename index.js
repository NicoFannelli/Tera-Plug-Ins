const SettingsUI = require('tera-mod-ui').Settings
const Vec3 = require('tera-vec3')

module.exports = function Tera_Plug_Ins(mod) {
	const Message = require('../tera-message')
	const MSG = new Message(mod)
	// Settings UI
	let ui = null
	if (global.TeraProxy.GUIMode) {
		ui = new SettingsUI(mod, require('./settings_structure'), mod.settings, { height: 500 })
		ui.on('update', settings => {
			mod.settings = settings
			
			if (mod.settings.cameraControl) {
				setCamera(mod.settings.setDistance)
			} else {
				mod.settings.setDistance = 500
				setCamera(500)
			}
		})
		this.destructor = () => {
			if (ui) {
				ui.close()
				ui = null
			}
		}
	}
	// Command /8
	mod.command.add("set", () => { ui.show() })
	
	mod.game.initialize('inventory');
	
	let myConsumables = []
	let monsterIDList = new Map()
	
	mod.game.on('enter_game', () => {
		lootRest()
		myConsumables = []
		monsterIDList.clear()
		iCount = mod.setInterval(removeBodyBlock, 3000)
	})
	
	mod.game.me.on('change_zone', (zone, quick) => {
		lootRest()
		
		if (mod.settings.redirect && zone == 9714) {
			mod.send('C_RESET_ALL_DUNGEON', 1, {})
		}
		
		// Unlock-Flying
		if (mod.settings.unLockFlying && zone==2000) {
			mod.send('S_ABNORMALITY_BEGIN', 4, {
				target: mod.game.me.gameId,
				source: mod.game.me.gameId,
				id: 30010000,
				duration: 0x7FFFFFFF,
				stacks: 1
			})
		}
		
		if (mod.settings.unLockFlying && zone!=2000) {
			mod.send('S_ABNORMALITY_END', 1, {
				target: mod.game.me.gameId,
				id: 30010000
			})
		}
	})
	
	// Auto-Redirect
	mod.hook('S_SPAWN_ME', 3, event => {
		if (mod.settings.cameraControl) {
			setTimeout(() => {
				setCamera(mod.settings.setDistance)
			}, 3000)
		}
		
		var dungeon = mod.settings.redirectInfo.find(obj => obj.zone == mod.game.me.zone)
		if (mod.settings.redirect && dungeon) {
			MSG.chat("已传送至 " + dungeon.name)
			
			event.loc = new Vec3(dungeon.loc)
			event.w = Math.PI / dungeon.w
			
			mod.send('C_PLAYER_LOCATION', 5, event)
			return true
		}
	})
	
	// Camera-Control
	function setCamera(distance) {
		mod.send('S_DUNGEON_CAMERA_SET', 1, {
			enabled: true,
			default: distance,
			max: distance
		})
	}
	
	// Cmd-Slash
	mod.command.add('r', () => {
		mod.send('C_RESET_ALL_DUNGEON', 1, {})
	})
	
	mod.command.add('d', () => {
		mod.send('C_LEAVE_PARTY', 1, {})
	})
	
	mod.command.add('t', () => {
		mod.send('C_DISMISS_PARTY', 1, {})
	})
	
	mod.command.add('q', () => {
		mod.send('C_RETURN_TO_LOBBY', 1, {})
	})
	
	mod.command.add('b', () => {
		mod.send('S_NPC_MENU_SELECT', 1, {type: 28})
	})
	
	// Command-Channel
	let currentChannel = 0
	
	mod.command.add('c', (arg) => {
		if (isNaN(arg)) {
			changeChannel(currentChannel + 1)
		} else {
			changeChannel(arg)
		}
	})
	
	mod.hook('S_CURRENT_CHANNEL', 2, event => {
		currentChannel = event.channel
	})
	
	function changeChannel(newChannel) {
		if (newChannel == currentChannel) return
		--newChannel
		mod.send('C_SELECT_CHANNEL', 1, {
			unk: 1,
			zone: mod.game.me.zone,
			channel: newChannel
		})
	}
	
	mod.hook('S_ABNORMALITY_BEGIN', 4, updateConsumables)
	
	mod.hook('S_ABNORMALITY_REFRESH', 2, updateConsumables)
	
	function updateConsumables(event) {
		// Consumable-Msg
		if (event.target == mod.game.me.gameId) {
			var abn = myConsumables.find(obj => obj.id == event.id)
			if (mod.settings.consumablesInfo.find(p => p.ID == event.id)) {
				event.startTime = Date.now()
				if (abn) {
					abn.startTime = Date.now()
					abn.duration = Number(event.duration)
				} else { 
					myConsumables.push(event)
				}
			}
		}
		// Monitor-Control
		if (mod.settings.abnormalityBlack) {
			if (mod.settings.abnormalityBlacklist.includes(event.id)) return false
		}
	}
	
	mod.hook('S_ABNORMALITY_END', 1, event => {
		if (event.target === mod.game.me.gameId) {
			var abn = myConsumables.find(obj => obj.id == event.id)
			if (abn && Date.now() > abn.startTime + Number(abn.duration) - 2000) {
				if (mod.settings.consumables) {
					MSG.alert((mod.settings.consumablesInfo.find(p => p.ID == event.id).msg + " 已过期"), 44)
					MSG.chat(MSG.YEL(mod.settings.consumablesInfo.find(p => p.ID == event.id).msg) + " 已过期")
				}
				myConsumables = myConsumables.filter(obj => obj.id != event.id)
			}
		}
	})
	
	mod.hook('S_START_ACTION_SCRIPT', 3, event => {
		return false
	})
	
	mod.hook('C_PLAYER_LOCATION', 5, event => {
		if ([0, 1, 5, 6].indexOf(event.type) > -1) {
			lastTimeMoved = Date.now()
		}
		
		location = {
			flying: false,
			pos: event.loc,
			dir: event.w
		}
	})
	
	// AFKer
	let lastTimeMoved = Date.now()
	
	mod.hook('C_RETURN_TO_LOBBY', 1, event => {
		if (mod.settings.afk) {
			if (Date.now() > lastTimeMoved + 60*60*1000) return false
		}
	})
	
	// Inspect
	mod.hook('S_ANSWER_INTERACTIVE', 2, event => {
		if (mod.settings.inspect) {
			mod.send('C_REQUEST_USER_PAPERDOLL_INFO', 3, {
				zoom: false,
				name: event.name
			})
		}
	})
	
	// Cutscene-Skip
	mod.hook('S_PLAY_MOVIE', 1, event => {
		if (mod.settings.sutsceneSkip) {
			mod.send('C_END_MOVIE', 1, {
				movie: event.movie,
				unk: true
			})
			return false
		}
	})
	
	// Social-Animation
	mod.hook('S_SOCIAL', 1, event => {
		if (mod.settings.socialAnimation) {
			if ([31, 32, 33].includes(event.animation)) return false
		}
	})
	
	// Artisan-Icons
	mod.hook('S_SPAWN_USER', 15, event => {
		if (mod.settings.artisanIcons) {
			event.icons = []
			return true
		}
	})
	
	// Spawn-Motes
	mod.hook('S_SPAWN_DROPITEM', 8, event => {
		if (mod.settings.spawnMotes) {
			if (mod.settings.spawnMotesInfo.includes(event.item)) return false
		}
	})
	
	// Collect-Balls
	mod.hook('S_SPAWN_NPC', 11, event => {
		if (mod.settings.findMonsterID) {
			monsterIDList.set(event.gameId, `${event.huntingZoneId}_${event.templateId}`)
		}
		
		if (mod.settings.spawnNPC) {
			if (mod.settings.spawnNpcInfo.find(obj => obj.Zone == event.huntingZoneId && obj.ID == event.templateId)) {
				return false
			}
		}
		
		// 屏蔽 風之沙漠幽靈
		if (event.huntingZoneId==630 && [2101, 2102].includes(event.templateId)) {
			return false
		}
		// 屏蔽 火之精髓
		if (event.huntingZoneId==630 && [2001, 3001, 3003].includes(event.templateId)) {
			return false
		}
		// 触发 風之精髓
		if (event.huntingZoneId==630 && [2000, 3000, 3002].includes(event.templateId)) {
			if (mod.settings.collectBalls) {
				mod.send('C_TRY_NPC_INTERACTION', 1, {
					target: event.gameId,
					loc: event.loc
				})
			}
		}
		// 屏蔽 電能生成裝置
		/* if (event.huntingZoneId==631 && [1001, 1002].includes(event.templateId)) {
			return false
		} */
		// 触发 電能精髓
		if (event.huntingZoneId==631 && event.templateId==4001) {
			if (mod.settings.collectBalls) {
				mod.send('C_TRY_NPC_INTERACTION', 1, {
					target: event.gameId,
					loc: event.loc
				})
			}
		}
	})
	
	// Dead-Animation / Find-MonsterID
	mod.hook('S_DESPAWN_NPC', 3, event => {
		if (mod.settings.findMonsterID) {
			if (event.type == 5 && monsterIDList.has(event.gameId)) {
				MSG.chat(`huntingZoneId_templateId: ${monsterIDList.get(event.gameId)}`)
				mod.log( `huntingZoneId_templateId: ${monsterIDList.get(event.gameId)}`)
				monsterIDList.delete(event.gameId)
			}
		}
		
		if (mod.settings.deadAnimation) {
			if (event.type == 5) {
				event.type = 1
				return true
			}
		}
	})
	
	// Archer-Traps
	mod.hook('S_SPAWN_PROJECTILE', 5, event => {
		if (mod.settings.archerTraps && event.gameId != mod.game.me.gameId) {
			if (mod.settings.trapSkills.includes(event.skill)) {
				event.gameId = mod.game.me.gameId
				return true
			}
		}
	})
	
	// Success-Chance
	mod.hook('S_REGISTER_EVOLUTION_ITEM', 3, event => {
		if (mod.settings.successChance) {
			event.hideSuccessChance = false
			return true
		}
	})
	
	mod.hook('S_REGISTER_ENCHANT_ITEM', 3, event => {
		if (mod.settings.successChance) {
			event.hideSuccessChance = false
			return true
		}
	})
	
	// Hide-Number
	mod.hook('S_EACH_SKILL_RESULT', 14, event => {
		switch (event.type) {
			case 1:
				// 伤害(输出)
				if (!mod.settings.damageNumber && event.target != mod.game.me.gameId) {
					event.type = 0
					return true
				}
				// 伤害(掉血)
				if (!mod.settings.damageNumberMe && event.target == mod.game.me.gameId) {
					event.type = 0
					return true
				}
				break
			case 2:
				// 治疗(队员)
				if (!mod.settings.healNumber && event.target != mod.game.me.gameId) {
					event.type = 0
					return true
				}
				// 治疗(自己)
				if (!mod.settings.healNumberMe && event.target == mod.game.me.gameId) {
					event.type = 0
					return true
				}
				break
			case 3:
				// 回蓝(队员)
				if (!mod.settings.mpNumber && event.target != mod.game.me.gameId) {
					event.type = 0
					return true
				}
				// 回蓝(自己)
				if (!mod.settings.mpNumberMe && event.target == mod.game.me.gameId) {
					event.type = 0
					return true
				}
				break
			default:
				break
		}
	})
	
	// Lockon-You-Msg
	mod.hook('S_LOCKON_YOU', 1, event => {
		if (!mod.settings.lockonYouMsg) {
			return false
		}
	})
	
	// No-Mote-Cancel
	mod.hook('C_CANCEL_SKILL', 3, event => {
		if (mod.settings.noMoteCancel && ((mod.game.me.templateId-10101)%100) == 7) {
			if ([18, 22].includes(Math.floor(event.skill.id/10000))) return false
		}
	})
	
	// No-Body-Block
	const partyMembers = new Set()
	const cache = Object.create(null)
	const partyObj = Object.create(null)
	let iCount = null
	
	function removeBodyBlock() {
		if (!mod.settings.noBodyBlock) return
		for (let i = partyMembers.values(), step; !(step = i.next()).done;) {
			partyObj.leader = step.value
			partyObj.unk1   = cache.unk1
			partyObj.unk2   = cache.unk2
			partyObj.unk3   = cache.unk3
			partyObj.unk4   = 1
			mod.send('S_PARTY_INFO', 1, partyObj)
		}
	}
	
	mod.hook('S_PARTY_INFO', 1, (event) => {
		Object.assign(cache, event)
	})
	
	mod.hook('S_PARTY_MEMBER_LIST', 7, (event) => {
		partyMembers.clear()
		for (let i = 0, arr = event.members, len = arr.length; i < len; ++i) {
			const member = arr[i]
			if (!member.online) continue
			partyMembers.add(member.gameId)
		}
	})
	
	// Auto-Vanguard
	mod.hook('S_COMPLETE_EVENT_MATCHING_QUEST', 1, (event) => {
		if (mod.settings.vanguard) {
			mod.send('C_COMPLETE_DAILY_EVENT', 1, { id: event.id })
			try {
				mod.setTimeout(() => { // 每日红利
					mod.send('C_COMPLETE_EXTRA_EVENT', 1, { type: 1 })
				}, 1000)
				mod.setTimeout(() => { // 每周红利
					mod.send('C_COMPLETE_EXTRA_EVENT', 1, { type: 0 })
				}, 1000)
			} catch (e) {}
			return false
		}
	})
	
	// Auto-Guild-Quest
	mod.hook('S_UPDATE_GUILD_QUEST_STATUS', 1, event => {
		if (mod.settings.guildQuest) {
			// mod.command.message('quest: ' + event.quest + ' status: ' + event.targets[0].total + '/' + event.targets[0].completed)
			if (event.targets[0].completed == event.targets[0].total) {
				try {
					mod.setTimeout(() => { // 完成任务
						mod.send('C_REQUEST_FINISH_GUILD_QUEST', 1, { quest: event.quest })
					}, 1000)
					mod.setTimeout(() => { // 接受任务
						mod.send('C_REQUEST_START_GUILD_QUEST', 1, { questId: event.quest })
					}, 3000)
				} catch (e) {}
			}
		}
	})
	
	// Find-ItemID
	mod.hook('S_SHOW_ITEM_TOOLTIP', 14, event => {
		if (mod.settings.findItemID) {
			MSG.chat("itemID: " + event.id)
			mod.log("[S_SHOW_ITEM_TOOLTIP] itemID: " + event.id)
		}
	})
	
	mod.hook('C_REQUEST_NONDB_ITEM_INFO', 2, event => {
		if (mod.settings.findItemID) {
			MSG.chat("itemID: " + event.item)
			mod.log("[C_REQUEST_NONDB_ITEM_INFO] itemID: " + event.item)
		}
	})
	
	// Fly-More
	const CATEGORY_GLOBAL = 9999
	const SKILL_FLYING_DISMOUNT = 65000001
	
	let location = null,
		outOfEnergy = false,
		dismountByUser = false,
		mountDisabled = false,
		inCombat = false,
		mountSkill = -1,
		serverMounted = false,
		remountTimer = null
	
	mod.hook('C_PLAYER_FLYING_LOCATION', 4, (event) => {
		location = {
			flying: true,
			pos: event.loc,
			dir: event.w
		}
		
		if (outOfEnergy && event.type !== 7 && event.type !== 8) {
			event.type = 7
			return true
		}
	})
	
	mod.hook('C_START_SKILL', 7, (event) => {
		if (event.skill.id == mountSkill || event.skill.id == SKILL_FLYING_DISMOUNT) {
			dismountByUser = true
			mountSkill = -1
		}
	})
	
	mod.hook('S_CANT_FLY_ANYMORE', 1, (event) => {
		if (mod.settings.flyMore) return false
	})
	
	mod.hook('S_MOUNT_VEHICLE', 2, {order: 10}, (event) => {
		if (event.gameId == mod.game.me.gameId) {
			const fakeMounted = mountSkill !== -1
			serverMounted = true
			mountSkill = event.skill
			if (fakeMounted) {
				return false
			}
		}
	})
	
	mod.hook('S_PLAYER_CHANGE_FLIGHT_ENERGY', 1, (event) => {
		outOfEnergy = (event.energy === 0)
	})
	
	mod.hook('S_SKILL_CATEGORY', 3, (event) => {
		if (event.category == CATEGORY_GLOBAL) {
			mountDisabled = !event.enabled
		}
	})
	
	mod.hook('S_UNMOUNT_VEHICLE', 2, {order: 10}, (event) => {
		if (event.gameId != mod.game.me.gameId) {
			return
		}
		serverMounted = false
		if (!location.flying || dismountByUser) {
			dismountByUser = false
			mountSkill = -1
		} else {
			clearTimeout(remountTimer)
			remountTimer = setTimeout(tryRemount, 50)
			return false
		}
	})
	
	mod.hook('S_USER_STATUS', 3, (event) => {
		if (event.gameId == mod.game.me.gameId) {
			inCombat = event.status == 1
		}
	})
	
	function tryRemount() {
		if (!mountDisabled && !inCombat) {
			mod.send('C_START_SKILL', 7, {
				skill: mountSkill,
				w: location.dir,
				loc: location.pos,
				unk: true
			})
			remountTimer = setTimeout(() => {
				if (!serverMounted) {
					mod.send('S_UNMOUNT_VEHICLE', 2, {
						gameId: mod.game.me.gameId,
						skill: mountSkill
					})
					mountSkill = -1
				}
			}, 1000)
		} else {
			mod.send('S_UNMOUNT_VEHICLE', 2, {
				gameId: mod.game.me.gameId,
				skill: mountSkill
			})
			mountSkill = -1
		}
	}
	
	// Auto-Loot
	let waitLoot = {},
		loot = false,
		loop = null
	
	mod.command.add(["loot", "拾取"], (arg) => {
		if (!arg) {
			MSG.chat(MSG.RED("请输入正确的参数!"))
		} else {
			var linkItemId = getItemIdChatLink(arg)
			if (linkItemId) {
				if (mod.settings.lootBlackList.includes(linkItemId)) {
					mod.settings.lootBlackList.splice(mod.settings.lootBlackList.indexOf(linkItemId), 1)
					MSG.chat(MSG.YEL("恢复拾取 - ") + MSG.TIP(linkItemId) + " " + getItemIdName(linkItemId))
				} else {
					mod.settings.lootBlackList.push(linkItemId)
					MSG.chat(MSG.BLU("过滤拾取 - ") + MSG.TIP(linkItemId) + " " + getItemIdName(linkItemId))
				}
			} else {
				MSG.chat(MSG.RED("输入的参数 无效!!"))
			}
		}
	})
	
	mod.hook('S_SYSTEM_MESSAGE', 1, (event) => {
		if (event.message == '@41') return false
	})
	
	mod.hook('C_TRY_LOOT_DROPITEM', 4, (event) => {
		if (!mod.settings.autoLoot && !loot) {
			loot = true
			loop = mod.setInterval(lootAll, mod.settings.loopInterval)
		}
	})
	
	mod.hook('S_SPAWN_DROPITEM', 8, (event) => {
		waitLoot[event.gameId] = event
		
		if (mod.settings.autoLoot && !loot) {
			loot = true
			loop = mod.setInterval(lootAll, mod.settings.loopInterval)
		}
	})
	
	mod.hook('S_DESPAWN_DROPITEM', 4, (event) => {
		if (event.gameId in waitLoot) {
			delete waitLoot[event.gameId]
		}
	})
	
	function lootRest() {
		waitLoot = {}
		loot = false
		mod.clearInterval(loop)
	}
	
	function lootAll() {
		if (mod.game.me.mounted) return
		
		var arr = Object.keys(waitLoot)
		if (arr.length == 0) {
			lootRest()
		}
		
		for (let i in waitLoot) {
			if (Math.abs(waitLoot[i].loc.x - location.pos.x) < 120 && Math.abs(waitLoot[i].loc.y - location.pos.y) < 120) {
				if (mod.settings.lootBlack && mod.settings.lootBlackList.includes(waitLoot[i].item)) {
					delete waitLoot[i]
				} else {
					mod.send('C_TRY_LOOT_DROPITEM', 4, {
						gameId: waitLoot[i].gameId
					})
				}
				return
			}
		}
	}
	
	function getItemIdChatLink(chatLink) {
		var id = chatLink.match(/#(\d*)@/)
		if (id) {
			return parseInt(id[1])
		} else if (!isNaN(parseInt(chatLink))) {
			return parseInt(chatLink)
		} else {
			return null
		}
	}
	
	function getItemIdName(id) {
		if (mod.game.inventory.find(id)) {
			return mod.game.inventory.find(id).data.name
		} else {
			return "自定义项目"
		}
	}
}
