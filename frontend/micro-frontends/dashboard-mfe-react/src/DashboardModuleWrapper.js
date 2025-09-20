import React, { useEffect, useRef } from 'react';
import { mount } from './bootstrap';

export default () => {
  const ref = useRef(null);

  useEffect(() => {
    mount(ref.current);
  }, []);

  return <div ref={ref} />;
};

// We need an Angular-compatible module definition
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// This is a placeholder component
@NgModule({ declarations: [], imports: [CommonModule], exports: [] })
export class DashboardModule { }