import simpleIconsGitHub from '@iconify/icons-simple-icons/github'
import simpleIconsQQ from '@iconify/icons-simple-icons/tencentqq'

// Keep only the static configuration data
export const NAV_CONFIG = [
  {
    to: '/',
    labelKey: 'links.首页',
    icon: 'home',
  },
  {
    to: '/create',
    labelKey: 'links.创建作业',
    icon: 'add',
  },
  {
    to: '/about',
    labelKey: 'links.关于',
    icon: 'info-sign',
  },
]

export const SOCIAL_CONFIG = [
  {
    iconType: 'blueprint',
    iconName: 'globe',
    href: 'https://maa.plus',
    labelKey: 'links.官网',
  },
  {
    iconType: 'blueprint',
    iconName: 'edit',
    href: 'https://github.com/MaaAssistantArknights/maa-copilot-frontend/issues/new/choose',
    labelKey: 'links.意见与反馈',
  },
  {
    iconType: 'iconify',
    iconSource: simpleIconsGitHub,
    href: 'https://github.com/MaaAssistantArknights/MaaAssistantArknights',
    labelKey: 'links.MAA_Repo',
  },
  {
    iconType: 'iconify',
    iconSource: simpleIconsGitHub,
    href: 'https://github.com/MaaAssistantArknights/maa-copilot-frontend',
    labelKey: 'links.前端',
  },
  {
    iconType: 'iconify',
    iconSource: simpleIconsGitHub,
    href: 'https://github.com/MaaAssistantArknights/MaaBackendCenter',
    labelKey: 'links.后端',
  },
  {
    iconType: 'iconify',
    iconSource: simpleIconsQQ,
    href: 'https://jq.qq.com/?_wv=1027&k=ElimpMzQ',
    labelKey: 'links.作业制作者交流群',
    labelParams: { groupNumber: '1169188429' }  // Modifiable group number
  },
  {
    iconType: 'iconify',
    iconSource: simpleIconsQQ,
    href: 'https://ota.maa.plus/MaaAssistantArknights/api/qqgroup/index.html',
    labelKey: 'links.作业分享群',
  },
]
