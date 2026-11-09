# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

ukey-skf：浏览器端智能密码钥匙（UKey）客户端 SDK（TypeScript 库，无运行时依赖），实现 GM/T 0016《智能密码钥匙密码应用接口规范》（2012/2023 版）的 SKF 接口。通过 WebSocket 与本机 UKey 控件服务通信（默认 `wss://127.0.0.1:1237`），把控件返回的十六进制报文解析为强类型结果。规范原文在 `doc/` 目录及 README 链接中，改动协议解析逻辑时应对照规范。

## 常用命令

```bash
pnpm lint          # ESLint 检查 src
pnpm format        # Prettier 格式化
pnpm build         # 清理后用 rollup 构建 lib/(CJS)、es/(ESM)、dist/(UMD)
pnpm lib           # 仅 tsc 输出 lib/（CommonJS，target es6）
pnpm es            # 仅 tsc 输出 es/（ESM，target es2024）
pnpm clean         # 删除 lib es dist
```

没有测试框架，也没有测试命令；验证方式是 `pnpm build` 编译通过，加上对真实 UKey 硬件的手工测试。

## 代码风格

Prettier 强制：Tab 缩进（宽度 4）、行宽 120、CRLF 换行、单引号、分号（`.vscode/settings.json` 已配置保存即格式化）。代码注释使用中文，新代码保持一致。

## 架构

两层结构（`src/index.ts` 导出全部模块）：

1. **`UKeyWebSocketClient`（传输层）**：WebSocket JSON 协议。发送 `{MsgId, Method: "<方法名>|<clsid>", Param: [...]}`，按 `MsgId` 在 `promiseResolvers_` Map 中匹配响应，返回 `{result, response}`。`clsid` 是构造 `UKeyClient` 时传入的控件 CLSID。方法签名接口定义在 `IUKeyWebSocketClient`。

2. **`UKeyClient`（解析层）**：每个方法 = 调传输层 → 校验响应码 → 按固定的十六进制偏移切分并解析为类型化数据。返回判别联合 `UKeyResponse<T>`（`success: true` 携带 `data`，`false` 携带 `error`）。PIN 相关方法返回 `UKeyPinResponse`，失败时额外携带 `remainingAttempts`。

### 响应报文解析规则（关键）

`response` 是十六进制字符串，且**整数按小端字节序存放**：所有整数读取必须经 `UKeyUtils.hexToInt`（内部先 `reverseStrByHex` 反转字节再 parse），不能直接 `parseInt(hex, 16)`。响应码固定在报文头 8 个 hex 字符（4 字节）。

传输层返回的 `response` 有两种格式，解析时必须区分：

- **十六进制报文**（返回数据的方法）：`UKeyUtils.getResponseCode()` 取响应码 → `getErrorCodeByHexString()` 查 `ErrorCode.ts` 的 SAR_* 错误码表；失败提前返回错误，成功再按偏移解析负载（各类负载偏移见 `UKeyClient.ts` 中对应方法）。
- **十进制数字符串**（void 类方法，如 `disConnectDev`、`setLabel`、`closeHandle`）：形如 `167772165` = `0x0a000005`。用 `UKeyUtils.checkCode()` 判断成功，失败时 `Number.parseInt(response)` 后 `getErrorCodeByCode()` 查表。

`ErrorCode.ts` 集中存放 GM/T 0016 的 SAR_* 错误码（含 2023 版新增码）；`constants.ts` 定义算法 ID 常量（`ALGORITHM_IDS`/`HASHALGO_IDS`，如 SGD_SM4_ECB、SGD_SM3）；`types.ts` 集中定义所有响应类型与密钥 Blob 类型（RSA/ECC 公私钥、签名、密文、会话密钥、文件属性等）。

## 环境说明

仓库位于网络共享盘（`//192.168.1.67/...`），git 命令可能报 "dubious ownership" 错误，需先执行 `git config --global --add safe-directory '%(prefix)///192.168.1.67/workspace/ukey'`。
