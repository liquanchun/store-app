import { Injectable } from '@angular/core';

@Injectable()
export class Config {
	// 是否生产模式
	isProduct = false;
	// 服务器地址
	server = '';
	// 服务器地址
	server2 = '';
	// 列表每页数量
	pageSize = 0;
	// 加载显示提示
	loadingText = '';
	// 网络连接请求超时时间
	timeout = 0;
	// 相隔锁屏时间
	lockTime = 0;
	// 自动同步通讯录时间
	autoSyncContactTime = 0;
	// 苹果黑名单列表
	ios_file_black_list = [];
	// 引导页版本号
	tutorialVersion = '';
	constructor() {
		if (this.isProduct) {
			this.server = 'http://localhost:5000/';
			this.server2 = 'http://localhost:3000/';
			this.pageSize = 20;

			this.loadingText = '加载中,请稍候...';
			// 10秒
			this.timeout = 30 * 1000;
			// 60秒
			this.lockTime = 60 * 1000;
			// 24小时
			this.autoSyncContactTime = 24 * 60 * 60 * 1000;

			this.ios_file_black_list = ["zip", "7z", "rar", "tar", "dbf", "flag", "flg", "sign", "et", "xps", "sql", "exe", "swf", "wps", "dbf"];

			this.tutorialVersion = "0.0.1";
		} else {
			this.server = 'http://localhost:5000/';
			this.server2 = 'http://localhost:3000/';
			this.pageSize = 20;
			this.loadingText = '加载中,请稍候...';
			// 30秒
			this.timeout = 30 * 1000;
			// 5秒
			this.lockTime = 5 * 1000;
			// 24小时
			this.autoSyncContactTime = 24 * 60 * 60 * 1000;

			this.ios_file_black_list = ["zip", "7z", "rar", "tar", "dbf", "flag", "flg", "sign", "et", "xps", "sql", "exe", "swf", "wps", "dbf"];

			this.tutorialVersion = "0.0.1";
		}
	}
}
