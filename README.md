# Power 4 - ThreeJS

<div style="display: flex; gap: 1rem; margin-bottom: 1rem;">

<img src="https://img.shields.io/badge/blender-%23F5792A.svg?style=for-the-badge&logo=blender&logoColor=white">

<img src="https://img.shields.io/badge/ThreeJs-black?style=for-the-badge&logo=three.js&logoColor=white">

<img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E">

<img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white">
</div>


ThreeJS version of the game Power 4.

Currently only two players in the same browser are supported.

The board was created using Blender and exported as a glTF file, as well as the piece model.

Instanced meshes are used to render the pieces multiple times with a single draw call.

## Possible improvements
- socket.io integration for multiplayer
- Ai to play against computer