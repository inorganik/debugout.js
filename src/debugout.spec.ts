import { Debugout } from './debugout';

describe('Debugout', () => {

  let debugout;
  const subjects = {
    string: 'A string',
    number: 26.2,
    boolean: false,
    date: new Date('2020-06-26T10:33:15Z'),
    array: [0, 'string', {}],
    object: { a: 'apple', b: 2, c: {}, d: [] },
    function: () => 'it works',
    regex: new RegExp(/debugout/),
    null: null
  };

  describe('# determineType', () => {

    beforeEach(() => {
      debugout = new Debugout();
    });

    it('should properly type a string', () => {
      expect(debugout.determineType(subjects.string)).toEqual('string');
    });
    it('should properly type a number', () => {
      expect(debugout.determineType(subjects.number)).toEqual('number');
    });
    it('should properly type a boolean', () => {
      expect(debugout.determineType(subjects.boolean)).toEqual('boolean');
    });
    it('should properly type a date', () => {
      expect(debugout.determineType(subjects.date)).toEqual('Date');
    });
    it('should properly type an array', () => {
      expect(debugout.determineType(subjects.array)).toEqual('Array');
    });
    it('should properly type an object', () => {
      expect(debugout.determineType(subjects.object)).toEqual('Object');
    });
    it('should properly type a function', () => {
      expect(debugout.determineType(subjects.function)).toEqual('function');
    });
    it('should properly type a regex', () => {
      expect(debugout.determineType(subjects.regex)).toEqual('RegExp');
    });
    it('should properly type null', () => {
      expect(debugout.determineType(subjects.null)).toEqual('null');
    });
  });

  describe('# indentsForDepth', () => {

    beforeEach(() => {
      debugout = new Debugout();
    });

    it('should work', () => {
      expect(debugout.indentsForDepth(1)).toEqual('  ');
      expect(debugout.indentsForDepth(2)).toEqual('    ');
      expect(debugout.indentsForDepth(3)).toEqual('      ');
    });
  });

  describe('# stringify', () => {

    beforeEach(() => {
      debugout = new Debugout();
    });

    it('should properly stringify a string', () => {
      expect(debugout.stringify(subjects.string)).toEqual('"A string"');
    });
    it('should properly stringify a number', () => {
      expect(debugout.stringify(subjects.number)).toEqual('26.2');
    });
    it('should properly stringify a boolean', () => {
      expect(debugout.stringify(subjects.boolean)).toEqual('false');
    });
    it('should properly stringify a date', () => {
      const result = debugout.stringify(subjects.date);
      expect(result.substring(0, 16)).toEqual('"Fri Jun 26 2020');
    });
    it('should properly stringify an array', () => {
      const expected = '[0, "string", \n  {}\n]';
      expect(debugout.stringify(subjects.array)).toEqual(expected);
    });
    it('should properly stringify an object', () => {
      const expected = '{\n  a: "apple",\n  b: 2,\n  c: {},\n  d: []\n}';
      expect(debugout.stringify(subjects.object)).toEqual(expected);
    });
    it('should properly stringify a function', () => {
      expect(debugout.stringify(subjects.function)).toEqual('function () { return \'it works\'; }');
    });
    it('should properly stringify a regex', () => {
      expect(debugout.stringify(subjects.regex)).toEqual('/debugout/');
    });
    it('should properly stringify null', () => {
      expect(debugout.stringify(subjects.null)).toEqual('null');
    });
  });
});
