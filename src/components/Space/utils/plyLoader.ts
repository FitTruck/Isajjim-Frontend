/**
 * PLY 로딩 유틸리티
 *
 * PLYLoader를 사용한 PLY 파일 로딩 및 PointsMaterial 생성
 * AI 서버에서 이미 전처리(축 정렬, Y-up 변환, 다운샘플링)된 PLY 사용
 */

import * as THREE from 'three';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader';

const loader = new PLYLoader();

export interface LoadedPLY {
  geometry: THREE.BufferGeometry;
  material: THREE.PointsMaterial;
}

/**
 * PLY 파일을 URL에서 로드
 * @param url PLY 파일 URL
 * @param pointSize 포인트 크기 (기본 0.01)
 * @returns Promise<LoadedPLY>
 */
export async function loadPLY(
  url: string,
  pointSize: number = 0.01,
  convertToYUp: boolean = true
): Promise<LoadedPLY> {
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (geometry) => {
        if (!geometry || !geometry.attributes || !geometry.attributes.position) {
          reject(new Error('Invalid PLY geometry'));
          return;
        }

        // Z-up → Y-up 좌표계 변환 (Three.js는 Y-up 사용)
        if (convertToYUp) {
          geometry.rotateX(-Math.PI / 2);
        }

        geometry.computeBoundingSphere();
        geometry.computeBoundingBox();

        // PointsMaterial 생성
        const hasColors = geometry.hasAttribute('color');
        const material = new THREE.PointsMaterial({
          size: pointSize,
          vertexColors: hasColors,
          sizeAttenuation: true,
        });

        // 색상이 없으면 기본 색상 설정
        if (!hasColors) {
          material.color = new THREE.Color(0x888888);
        }

        resolve({ geometry, material });
      },
      undefined,
      (error) => {
        reject(error);
      }
    );
  });
}

/**
 * 지오메트리의 바운딩 박스 크기 계산 (m 단위)
 */
export function getGeometrySize(geometry: THREE.BufferGeometry): THREE.Vector3 {
  if (!geometry.boundingBox) {
    geometry.computeBoundingBox();
  }
  const size = new THREE.Vector3();
  geometry.boundingBox!.getSize(size);
  return size;
}

/**
 * PLY 지오메트리를 목표 크기로 스케일링 (균일)
 * @param geometry 원본 지오메트리
 * @param targetWidth 목표 너비 (m)
 * @param targetDepth 목표 깊이 (m)
 * @param targetHeight 목표 높이 (m)
 * @returns 스케일 팩터
 */
export function scaleGeometryToSize(
  geometry: THREE.BufferGeometry,
  targetWidth: number,
  targetDepth: number,
  targetHeight: number
): number {
  const currentSize = getGeometrySize(geometry);

  // 균일 스케일링 (비율 유지)
  const scaleX = targetWidth / currentSize.x;
  const scaleY = targetHeight / currentSize.y;
  const scaleZ = targetDepth / currentSize.z;

  // 가장 작은 스케일 사용 (박스 내 맞추기)
  const scale = Math.min(scaleX, scaleY, scaleZ);

  return scale;
}

/**
 * PLY 지오메트리를 목표 크기에 정확히 맞추기 (비균일 스케일링)
 * @param geometry 원본 지오메트리
 * @param targetWidth 목표 너비 (m) - X축
 * @param targetDepth 목표 깊이 (m) - Z축
 * @param targetHeight 목표 높이 (m) - Y축
 * @returns { scaleX, scaleY, scaleZ }
 */
export function getExactScale(
  geometry: THREE.BufferGeometry,
  targetWidth: number,
  targetDepth: number,
  targetHeight: number
): { scaleX: number; scaleY: number; scaleZ: number } {
  const currentSize = getGeometrySize(geometry);

  return {
    scaleX: targetWidth / currentSize.x,
    scaleY: targetHeight / currentSize.y,
    scaleZ: targetDepth / currentSize.z,
  };
}
