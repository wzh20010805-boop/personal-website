# Live2D browser runtime

Pinned files are served locally; visitors do not load a third-party CDN.

| File | Source | License |
| --- | --- | --- |
| `pixi-6.5.10.min.js` | https://unpkg.com/pixi.js@6.5.10/dist/browser/pixi.min.js | MIT, see `LICENSE.pixi.txt` |
| `pixi-live2d-display-0.4.0.min.js` | https://unpkg.com/pixi-live2d-display@0.4.0/dist/cubism4.min.js | MIT, see `LICENSE.pixi-live2d-display.txt` |
| `live2dcubismcore-5.2.min.js` | https://cubism.live2d.com/sdk-web/core/05/live2dcubismcore.min.js | Live2D Proprietary Software License Agreement, retained in the file header: https://www.live2d.com/eula/live2d-proprietary-software-license-agreement_en.html |

The Core version is pinned to the official Cubism 5.2 path to support this model's MOC3 version 5. The display adapter's `cubism4` name also covers compatible MOC3 models loaded by that Core.

The character assets were re-exported from the updated `seethrough_sparse_v4.psd2live` project in the supplied `seethrough-motion-sparse-v4-20261021` output using PSD2Live 3.4.5's `moc3` target. The model, display information, physics, textures, and all 11 authored motion files come from that export; motion files are only renamed to preserve the website's action mapping. The exporter reported no losses. The player enables the supplied physics, loops the three idle motions, and disables additional breathing, auto-blinking and lip sync to preserve the authored motion.

Mouse tracking uses PSD2Live 3.4.5's `CubismSdkPreviewSessionKt.CUBISM_POINTER_TRACKING_BINDINGS`: head X/Y at 30, body X at 10, and eyeball X/Y at 1. The supplied project's `workspace.json` enables mouse tracking with smoothing disabled. The website adds those five bindings to each authored pose before physics, using the character canvas to normalize page pointer coordinates; it leaves the authored Z rotation unchanged. Pointer events are passive, touch does not create a hover target, and leaving the page, losing focus or hiding the tab clears the target. Moving or resizing the pet re-projects the last pointer position without reloading the model.
