/**
 * Chinese (Simplified) translations
 */

import { LanguageMap } from '../types.js';

export const zh: LanguageMap = {
  menus: {
    selectPrompt: '输入选项或用↑↓选择,回车确认',
    multiSelectPrompt: '空格选中/取消,回车确认',
    confirmPrompt: '回车确认',
    selectedCount: '项已选',
    yes: '是',
    no: '否',
    scrollIndicator: '第 {current}/{total} 项 | ↑↓ 滚动查看更多'
  },
  hints: {
    arrows: '↑↓ 方向键',
    space: '空格 选中/取消',
    enter: '⏎ 确认',
    numbers: '0-9 输入序号',
    letters: '字母 快捷键',
    selectAll: 'A 全选',
    invert: 'I 反选',
    yesNo: 'Y/N 快捷键',
    exit: 'Ctrl+C 退出'
  },
  messages: {
    success: '成功',
    error: '错误',
    warning: '警告',
    info: '提示',
    question: '问题',
    goodbye: '👋 再见!',
    unknownCommand: '未知命令',
    helpPrompt: '输入 /help 查看可用命令'
  },
  inputs: {
    defaultValue: '默认',
    enterText: '请输入文本',
    enterNumber: '请输入数字',
    minLength: '最小长度',
    maxLength: '最大长度',
    minValue: '最小值',
    maxValue: '最大值',
    invalidInput: '输入无效',
    cannotBeEmpty: '输入不能为空'
  },
  commands: {
    quit: '退出应用程序',
    help: '显示帮助信息',
    clear: '清除屏幕',
    back: '返回上一级菜单',
    availableCommands: '可用命令',
    defaultCommands: '默认命令',
    customCommands: '自定义命令'
  }
};
