
// assets
import { DocumentCode2, OceanProtocol, Level, ShieldCross, InfoCircle, I24Support, Driving } from 'iconsax-react';

// icons
const icons = {
  samplePage: DocumentCode2,
  menuLevel: OceanProtocol,
  menuLevelSubtitle: Level,
  disabledMenu: ShieldCross,
  chipMenu: InfoCircle,
  documentation: I24Support,
  roadmap: Driving
};

// ==============================|| MENU ITEMS - SUPPORT ||============================== //

const support = {
  id: 'other',
  title: "메뉴명",
  type: 'group',
  children: [
    {
      id: 'member',
      title: '회원관리',
      type: 'item',
      url: '/member-list',
      icon: icons.samplePage
    },
    {
      id: 'order',
      title: '결제내역관리',
      type: 'item',
      url: '/order-list',
      icon: icons.documentation,
    },
    {
      id: 'subscribe',
      title: '구독관리',
      type: 'item',
      url: '/subscribe-list',
      icon: icons.roadmap,
    },
    {
      id: 'documentation',
      title: '홈페이지이동',
      type: 'item',
      url: 'https://taggingbox.im:3443',
      icon: icons.documentation,
      external: true,
      target: true
      // chip: {
      //   label: 'gitbook',
      //   color: 'info',
      //   size: 'small'
      // }
    },
  ]
};

export default support;
