import { TestBed } from '@angular/core/testing';

import { OperariosService } from './operarios.service';

describe('OperariosService', () => {
  let service: OperariosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OperariosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
