# Living Contours · 生长之间

直接用浏览器打开 `index.html` 即可运行，也可以使用 VS Code Live Server。没有安装依赖或构建步骤，可放在 GitHub Pages 的 `CT3 W3/` 路径下。

这是 TouchDesigner Living Contours v3 的浏览器移植版本，使用 Canvas 2D 和 JavaScript 执行独立的轮廓模拟；不是浏览器直接加载 `.toe`，也不会远程控制桌面上的 TouchDesigner。保留生长、Noise、接触凋零、萌发、笔触和色彩等可调参数。两种运行环境的噪声和绘制不同，结果不逐帧相同。Simplex 动态流场采用随时间移动的二维场，Perlin 3D 使用三维场。

- 暂停：冻结生长，仍可调整颜色和笔触。
- 重新萌发：新随机种子，重建初始生态。
- 默认参数：只恢复参数，不重置形状。
- 导出状态 / 导入状态：保存和恢复参数、全部轮廓、时间和随机数状态。
- 保存画面：导出指定分辨率 PNG。
- 全屏：画布右下角按钮。

轮廓逐段向外推进，接触时局部凋零，并在有空间的位置渐显新芽。模拟使用空间采样近似碰撞，极端参数下可能出现细微相触。降低数量上限、细节层数和输出分辨率可减轻计算负担。后台标签页暂停演化，回到页面时不会追赶时间或跳变。

原 TouchDesigner 文件位于 `touchdesigner/`，作为原工程保留，可用 TouchDesigner 单独打开。网页无需它们便能运行。


## Performance update
The English interface uses a Blob Web Worker with OffscreenCanvas on supported browsers. Simulation and rendering run off the UI thread. Paths are batched by stroke width and opacity; spatial queries skip irrelevant cells. Live preview is capped at 768 × 768, while image exports retain the chosen output resolution. Older browsers fall back to main-thread rendering.


## GPU performance revision
Live rendering now uses one WebGL2 triangle batch with persistent vertex buffers. Canvas2D is retained for PNG export and unsupported browsers. Collision samples use reusable typed-array bins; noise is shared through an 80×80 bilinear field updated every 0.1 simulation seconds. Fine noise details may look slightly smoother. The scheduler subtracts computation time from its frame delay instead of adding an unconditional 16ms wait. Hover over the shape counter for measured FPS and CPU submission timings. These are measurements, not a guaranteed frame rate.
