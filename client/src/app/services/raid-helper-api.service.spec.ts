import { TestBed } from '@angular/core/testing';

import { RaidHelperApiService } from './raid-helper-api.service';

describe('RaidHelperApiService', () => {
  let service: RaidHelperApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RaidHelperApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
