module.exports = [
    {
        "key": "autoLoot",
        "name": "拾取脚本 - 开启(勾选) / 关闭(取消)",
        "type": "bool"
    },
    {
        "key": "lootBlack",
        "name": "拾取脚本 - 过滤拾取(勾选) / 全部拾取(取消)",
        "type": "bool"
    },
    {
        "key": "loopInterval",
        "name": "拾取脚本 - 拾取间隔(单位ms)",
        "type": "number",
        "min": 350,
        "max": 2000,
        "step": 1
    },
    {
        "key": "cameraControl",
        "name": "镜头距离 - 自定义(勾选后生效)",
        "type": "bool"
    },
    {
        "key": "setDistance",
        "name": "镜头距离 - 设定大小",
        "type": "number",
        "min": 500,
        "max": 2000,
        "step": 1
    },
    {
        "key": "shake",
        "name": "镜头抖动 - 自定义(不勾选则无晃动)",
        "type": "bool"
    },
    {
        "key": "power",
        "name": "镜头抖动 - 晃动强度(少许延迟后生效)",
        "type": "number",
        "min": 0.0,
        "max": 100.0,
        "step": 0.25
    },
    {
        "key": "speed",
        "name": "镜头抖动 - 晃动频率(少许延迟后生效)",
        "type": "number",
        "min": 0.0,
        "max": 100.0,
        "step": 0.25
    },
    {
        "key": "autoServant",
        "name": "自动喂养 - 宠物/小跟班",
        "type": "bool"
    },
    {
        "key": "servantUseAt",
        "name": "自动喂养 - 能量触发% (0-100%)",
        "type": "number",
        "min": 0.0,
        "max": 100.0,
        "step": 1
    },
    {
        "key": "vanguard",
        "name": "自动提交 - H/每日/每周奖励",
        "type": "bool"
    },
    {
        "key": "guildQuest",
        "name": "自动提交 - 公会任务 完成/接收",
        "type": "bool"
    },
    {
        "key": "redirect",
        "name": "尾王传送 - 单人试炼本 VIP本",
        "type": "bool"
    },
    {
        "key": "inspect",
        "name": "查询装备 - 左键/右键 点击昵称",
        "type": "bool"
    },
    {
        "key": "flyMore",
        "name": "飞行能量 - 任意飞行器无限",
        "type": "bool"
    },
    {
        "key": "unLockFlying",
        "name": "飞行解锁 - 空岛地图(需完成主线)",
        "type": "bool"
    },
    {
        "key": "collectBalls",
        "name": "飞行守护 - 自动吸球",
        "type": "bool"
    },
    {
        "key": "afk",
        "name": "挂机防掉 - 阻止 返回角色菜单",
        "type": "bool"
    },
    {
        "key": "abnormalityBlack",
        "name": "屏幕异常 - 移除(啤酒)扭曲 等效果",
        "type": "bool"
    },
    {
        "key": "sutsceneSkip",
        "name": "跳过动画 - 略过CG免按ESC",
        "type": "bool"
    },
    {
        "key": "socialAnimation",
        "name": "闲置动作 - 禁用 拍手/伸懒腰",
        "type": "bool"
    },
    {
        "key": "artisanIcons",
        "name": "工匠图标 - 移除(非自己)",
        "type": "bool"
    },
    {
        "key": "deadAnimation",
        "name": "死亡效果 - 移除(尸体)灰烬",
        "type": "bool"
    },
    {
        "key": "noBodyBlock",
        "name": "碰撞体积 - 消除队员与自己",
        "type": "bool"
    },
    {
        "key": "consumables",
        "name": "消耗过期 - 羊肉/秘药/勇猛/子弹/水晶保护",
        "type": "bool"
    },
    {
        "key": "noMoteCancel",
        "name": "技能施法 - 精气晶球(元素)移动无中断",
        "type": "bool"
    },
    {
        "key": "archerTraps",
        "name": "显示PVP [弓箭]的陷阱位置",
        "type": "bool"
    },
    {
        "key": "successChance",
        "name": "显示 升级[遗物/圣物]成功率",
        "type": "bool"
    },
    {
        "key": "damageNumber",
        "name": "显示 (输出)伤害数字",
        "type": "bool"
    },
    {
        "key": "damageNumberMe",
        "name": "显示 (掉血)伤害数字",
        "type": "bool"
    },
    {
        "key": "healNumber",
        "name": "显示 治疗数字",
        "type": "bool"
    },
    {
        "key": "healNumberMe",
        "name": "显示 治疗数字(自己)",
        "type": "bool"
    },
    {
        "key": "mpNumber",
        "name": "显示 回蓝数字",
        "type": "bool"
    },
    {
        "key": "mpNumberMe",
        "name": "显示 回蓝数字(自己)",
        "type": "bool"
    },
    {
        "key": "lockonYouMsg",
        "name": "显示 被锁定[绿字消息]",
        "type": "bool"
    },
    {
        "key": "spawnNPC",
        "name": "屏蔽 - 元素召唤 忍者圆木 哨兵塔 机器人 影子",
        "type": "bool"
    },
    {
        "key": "spawnMotes",
        "name": "屏蔽 - 元素制造的 精气晶球",
        "type": "bool"
    },
    {
        "key": "findItemID",
        "name": "打印 - 鼠标悬停位置 物品ID",
        "type": "bool"
    },
    {
        "key": "findMonsterID",
        "name": "打印 - 击杀怪物的 huntingZoneId_templateId",
        "type": "bool"
    }
]
