import {describeDirectorySpecTest} from "../../../src/single";
import {join} from "path";
import {AnyContainerType, AnySSZType, serialize} from "@chainsafe/ssz";
import {bool, number64} from "@chainsafe/eth2.0-ssz-types/lib/generators/primitive";
import {unlinkSync, writeFileSync} from "fs";
import {before, after} from "mocha";
import {loadYamlFile} from "@chainsafe/eth2.0-utils";

export interface ISimpleStruct {
  test: boolean;
  number: number;
}

export interface ISimpleCase extends Iterable<string> {
  input: ISimpleStruct;
  output: number;
}

const inputSchema: AnyContainerType = {
  fields: [
    ["test", bool],
    ["number", number64]
  ]
};

before(() => {
  yamlToSSZ(
    join(__dirname, "../_test_files/single/case0/input.yaml"),
    inputSchema
  );
  yamlToSSZ(
    join(__dirname, "../_test_files/single/case0/output.yaml"),
    number64
  );
  yamlToSSZ(
    join(__dirname, "../_test_files/single/case1/input.yaml"),
    inputSchema
  );
  yamlToSSZ(
    join(__dirname, "../_test_files/single/case1/output.yaml"),
    number64
  );
});

after(() => {
  unlinkSync(join(__dirname, "../_test_files/single/case0/input.ssz"));
  unlinkSync(join(__dirname, "../_test_files/single/case0/output.ssz"));
  unlinkSync(join(__dirname, "../_test_files/single/case1/input.ssz"));
  unlinkSync(join(__dirname, "../_test_files/single/case1/output.ssz"));
});

describeDirectorySpecTest<ISimpleCase, number>(
  "single spec test",
  join(__dirname, "../_test_files/single"),
  (testCase) => {
    return testCase.input.number;
  },
  {
    sszTypes: {
      input: inputSchema,
      output: number64
    },
    shouldError: (testCase => !testCase.input.test),
    getExpected: (testCase) => testCase.output,
  }
);

function yamlToSSZ(file: string, sszSchema: AnySSZType): void {
  const input: any = loadYamlFile(file);
  if(input.number) {
    input.number = input.number.toNumber();
  }
  writeFileSync(file.replace(".yaml", ".ssz"), serialize(input, sszSchema));
}