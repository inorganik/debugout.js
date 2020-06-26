import { Debugout } from './debugout';

describe('Debugout', () => {

  let debugout;

  describe('# determineType', () => {

    beforeEach(() => {
      debugout = new Debugout();
    });

    it('should properly type a string', () => {
      const subject = 'A string';
      expect(debugout.determineType(subject)).toEqual('string');
    });
    it('should properly type a number', () => {
      const subject = 26.2;
      expect(debugout.determineType(subject)).toEqual('number');
    });
    it('should properly type a boolean', () => {
      const subject = false;
      expect(debugout.determineType(subject)).toEqual('boolean');
    });
    it('should properly type a date', () => {
      const subject = new Date();
      expect(debugout.determineType(subject)).toEqual('Date');
    });
    it('should properly type an array', () => {
      const subject = [0, 'string', {}];
      expect(debugout.determineType(subject)).toEqual('Array');
    });
    it('should properly type an object', () => {
      const subject = { a: 'apple', b: 2, c: {}, d: [] };
      expect(debugout.determineType(subject)).toEqual('Object');
    });
    it('should properly type a function', () => {
      const subject = () => 'it works';
      expect(debugout.determineType(subject)).toEqual('function');
    });
    it('should properly type a regex', () => {
      const subject = new RegExp(/debugout/);
      expect(debugout.determineType(subject)).toEqual('RegExp');
    });
    it('should properly type null', () => {
      const subject = null;
      expect(debugout.determineType(subject)).toEqual('null');
    });
  });
});
