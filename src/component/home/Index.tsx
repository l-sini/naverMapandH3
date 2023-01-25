import { cellsToMultiPolygon, latLngToCell } from 'h3-js';
import React, { useEffect, useRef, useState } from 'react';
import { useMany, useSaver } from '../../hooks/api';
import { IBasic } from '../../model/home';

interface Props {}

const MAPCENTER = [37.544186, 127.044127];

export const Home: React.FC<Props> = () => {
  const map = useRef<any>();
  const newLatLngCellRef = useRef<any>(null);
  const maps = document.getElementById('naverMap');
  const [checkChange, setCheckChange] = useState<boolean>(false);
  const [newPolygonList, setNewPolygonList] = useState<any[]>([]);
  const [multiPolygonList, setMultiPolygonList] = useState<any[]>([]);
  const [currentDrawedPolygon, setCurrentDrawedPolygon] = useState<any[]>([]);
  const onChangeMultiPolygon = (list: any) => {
    const newMultiPolygon = list.map((q: any) =>
      q.map((w: any) => w.map((e: any) => [e[1], e[0]]))
    );
    return newMultiPolygon;
  };
  const setPolygon = () => {
    if (multiPolygonList && map.current) {
      currentDrawedPolygon.map(p => p?.setMap(null));
      const newList: any = [];
      multiPolygonList.map(poly => {
        const newPolygon = new naver.maps.Polygon({
          paths: poly,
          fillColor: '#ff0000',
          fillOpacity: 0.3,
          strokeColor: '#ff0000',
          strokeOpacity: 0.6,
          strokeWeight: 3,
          map: map.current,
        });
        newList.push(newPolygon);
        newPolygon?.setMap(map.current);
      });
      setCurrentDrawedPolygon(newList);
    }
  };
  const initMap = () => {
    if (maps) {
      map.current = new naver.maps.Map('naverMap', {
        center: new naver.maps.LatLng(MAPCENTER[0], MAPCENTER[1]),
        zoom: 13,
      });
    }
  };

  const clickEvent = (evt: any) => {
    const centerPosition = evt.coord;
    const newLatLngCell = latLngToCell(centerPosition.y, centerPosition.x, 10);
    newLatLngCellRef.current = newLatLngCell;
    setCheckChange(true);
  };

  const drawingMap = () => {
    if (maps) {
      naver.maps.Event.addListener(map.current, 'click', clickEvent);
    }
  };

  const { data, refetch } = useMany<IBasic[]>('/api/h3', {}, [], false);

  const saveNewPolygon = useSaver<any>('/api/h3', res => {
    currentDrawedPolygon.map(poly => poly?.setMap(null));
    newPolygonList.map(poly => poly.polygon?.setMap(null));
    setNewPolygonList([]);
    const newData = cellsToMultiPolygon(res?.map((d: any) => d.index));
    setMultiPolygonList(onChangeMultiPolygon(newData));
  });

  const onSubmitSave = () => {
    const param = newPolygonList.map(poly => poly.index);
    saveNewPolygon.mutate({ indexs: param });
  };

  useEffect(() => {
    initMap();
    drawingMap();
  }, [maps]);

  useEffect(() => {
    if (checkChange) {
      if (data?.some(poly => poly.index === newLatLngCellRef.current)) {
        console.log('err>>>');
        newLatLngCellRef.current = null;
        setCheckChange(false);
        return;
      }
      const checkDuplicate = newPolygonList.some(
        poly => poly.index === newLatLngCellRef.current
      );
      if (checkDuplicate) {
        newPolygonList?.map(poly => poly.polygon?.setMap(null));
        const newList = newPolygonList.filter(
          poly => poly.index !== newLatLngCellRef.current
        );
        setNewPolygonList(newList);
        newList?.map(l => l.polygon.setMap(map.current));
      } else {
        const newData = cellsToMultiPolygon([newLatLngCellRef.current]);
        const newMultiPolygon = onChangeMultiPolygon(newData);
        const newPolygon = new naver.maps.Polygon({
          paths: newMultiPolygon[0],
          fillColor: '#1565C0',
          fillOpacity: 0.3,
          strokeColor: '#1565C0',
          strokeOpacity: 0.6,
          strokeWeight: 3,
          zIndex: 1,
          map: map.current,
        });
        newPolygon?.setMap(map.current);
        const newPoint = {
          index: newLatLngCellRef.current,
          polygon: newPolygon,
        };
        setNewPolygonList([...newPolygonList, newPoint]);
      }
      newLatLngCellRef.current = null;
      setCheckChange(false);
    }
  }, [checkChange]);

  useEffect(() => {
    if (data && data.length) {
      const newData = cellsToMultiPolygon(data.map(d => d.index));
      setMultiPolygonList(onChangeMultiPolygon(newData));
    }
  }, [data]);

  useEffect(() => {
    refetch();
  }, []);

  useEffect(() => {
    multiPolygonList && multiPolygonList.length && setPolygon();
  }, [multiPolygonList]);

  return (
    <>
      <p>navermap</p>
      <div
        style={{
          margin: '1rem',
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <button onClick={onSubmitSave}>저장</button>
      </div>
      <div id='naverMap' ref={map} style={{ width: '100%', height: '500px' }} />
    </>
  );
};
