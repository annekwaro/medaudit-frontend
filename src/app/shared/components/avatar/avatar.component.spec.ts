import { TestBed } from '@angular/core/testing';
import { AvatarComponent } from './avatar.component';

function render(name: string): string {
  const fixture = TestBed.createComponent(AvatarComponent);
  fixture.componentRef.setInput('name', name);
  fixture.detectChanges();
  return fixture.nativeElement.textContent.trim();
}

describe('AvatarComponent', () => {
  it('uses the first and last name, skipping titles', () => {
    expect(render('Dr. Sarah Martin')).toBe('SM');
    expect(render('Mateo Fernández')).toBe('MF');
    expect(render('Ana María de la Cruz')).toBe('AC');
  });

  it('uses one letter for a single name', () => {
    expect(render('Grace')).toBe('G');
  });
});
