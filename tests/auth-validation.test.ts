import assert from 'node:assert/strict';
import test from 'node:test';
import { validateAuth, type AuthValues } from '../lib/auth-validation.ts';

const validValues: AuthValues = {
  fullName: 'Alex Morgan',
  email: 'alex@example.com',
  password: 'learnmore',
  confirmPassword: 'learnmore',
};

test('login requires email and password, without signup fields', () => {
  const errors = validateAuth('login', {
    fullName: '',
    email: ' ',
    password: ' ',
    confirmPassword: '',
  });
  assert.deepEqual(Object.keys(errors).sort(), ['email', 'password']);
});

test('login accepts a nonblank password without applying the signup length rule', () => {
  assert.deepEqual(
    validateAuth('login', {
      ...validValues,
      fullName: '',
      password: 'abc',
      confirmPassword: '',
    }),
    {}
  );
});

test('email validation rejects malformed addresses', () => {
  for (const email of [
    'alex',
    'alex@',
    '@example.com',
    'alex@example',
    'alex @example.com',
    'a@@example.com',
  ]) {
    assert.ok(validateAuth('login', { ...validValues, email }).email, email);
  }
});

test('surrounding email whitespace is accepted without mutating the form values', () => {
  const values = { ...validValues, email: ' alex+school@example.co.uk ' };
  assert.deepEqual(validateAuth('signup', values), {});
  assert.equal(values.email, ' alex+school@example.co.uk ');
});

test('signup reports every required field', () => {
  const errors = validateAuth('signup', {
    fullName: ' ',
    email: '',
    password: '',
    confirmPassword: '',
  });
  assert.deepEqual(Object.keys(errors).sort(), [
    'confirmPassword',
    'email',
    'fullName',
    'password',
  ]);
});

test('signup requires at least eight characters and rejects all whitespace', () => {
  for (const password of ['1234567', '        ']) {
    assert.ok(
      validateAuth('signup', { ...validValues, password, confirmPassword: password }).password
    );
  }
  assert.deepEqual(
    validateAuth('signup', { ...validValues, password: '12345678', confirmPassword: '12345678' }),
    {}
  );
});

test('signup compares passwords exactly, including spaces and case', () => {
  for (const confirmPassword of ['Learnmore', 'learnmore ', 'different']) {
    assert.ok(validateAuth('signup', { ...validValues, confirmPassword }).confirmPassword);
  }
  assert.deepEqual(
    validateAuth('signup', {
      ...validValues,
      password: ' learn more ',
      confirmPassword: ' learn more ',
    }),
    {}
  );
});

test('matching confirmation clears an earlier mismatch', () => {
  assert.ok(
    validateAuth('signup', { ...validValues, confirmPassword: 'mismatch' }).confirmPassword
  );
  assert.deepEqual(validateAuth('signup', validValues), {});
});
