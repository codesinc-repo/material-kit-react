import { useCallback, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Link from 'next/link';
import { Auth } from 'aws-amplify';

import {
  Alert,
  Box,
  Button,
  FormHelperText,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography
} from '@mui/material';

import { Layout as AuthLayout } from 'src/layouts/auth/layout';



const Page = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [method, setMethod] = useState('email');

  const handleSkip = () => {
    setMethod('/admin/dashboard');
  };

  const formik = useFormik({
    initialValues: {
      email: 'demo@devias.io',
      password: 'Password123!',
      submit: null
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
      password: Yup.string().max(255).required('Password is required'),
    }),
    onSubmit: async (values, helpers) => {
      setIsLoading(true);
      setLoginError(null);

      try {
        await Auth.signIn(values.email, values.password);
        const user = await Auth.currentAuthenticatedUser();
        const isAdmin = user.signInUserSession.idToken.payload['cognito:groups']?.includes('Admin');  
        
        if (isAdmin) {
          router.push('/admin/dashboard');
        } else {
          router.push('/');
        }
      } catch (err) {
        setLoginError(err.message);
      } finally {
        setIsLoading(false);
      }
      
  Auth.updateUserAttributes(user, {
    'custom:group': 'Admin' // You can set the group here
  });

    },
  });

  const handleMethodChange = useCallback(
    (event, value) => {
      setMethod(value);
    },
    []
  );

  return (
    <>
      <Head>
        <title>Login | Binge Admin</title>
      </Head>
      <Box
        sx={{
          backgroundColor: 'background.paper',
          flex: '1 1 auto',
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <Box
          sx={{
            maxWidth: 550,
            px: 3,
            py: '100px',
            width: '100%'
          }}
        >
          <div>
            <Stack spacing={1} sx={{ mb: 3 }}>
              <Typography variant="h4">Login</Typography>
              <Typography
                color="text.secondary"
                variant="body2"
              >
                Don't have an account?
                &nbsp;
                <Link href="/auth/register" passHref>
                  Register
                </Link>
              </Typography>
            </Stack>
            <Tabs
              onChange={handleMethodChange}
              sx={{ mb: 3 }}
              value={method}
            >
              <Tab
                label="Email"
                value="email"
              />
            </Tabs>
            {isLoading ? (
              <Typography>Loading...</Typography>
            ) : (
              method === 'email' && (
                <form noValidate onSubmit={formik.handleSubmit}>
                  <Stack spacing={3}>
                    <TextField
                      error={!!(formik.touched.email && formik.errors.email)}
                      fullWidth
                      helperText={formik.touched.email && formik.errors.email}
                      label="Email Address"
                      name="email"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      type="email"
                      value={formik.values.email}
                    />
                    <TextField
                      error={!!(formik.touched.password && formik.errors.password)}
                      fullWidth
                      helperText={formik.touched.password && formik.errors.password}
                      label="Password"
                      name="password"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      type="password"
                      value={formik.values.password}
                    />
                  </Stack>
                  <FormHelperText sx={{ mt: 1 }}>
                    Optionally you can skip.
                  </FormHelperText>
                  {loginError && (
                    <Typography color="error" sx={{ mt: 3 }} variant="body2">
                      {loginError}
                    </Typography>
                  )}
                  <Button
                    fullWidth
                    size="large"
                    sx={{ mt: 3 }}
                    type="submit"
                    variant="contained"
                  >
                    Continue
                  </Button>
                  <Button
                    fullWidth
                    size="large"
                    sx={{ mt: 3 }}
                    onClick={handleSkip}
                  >
                    Skip authentication
                  </Button>
                  <Alert
                    color="primary"
                    severity="info"
                    sx={{ mt: 3 }}
                  >
                    <div>
                      You can use <b>demo@devias.io</b> and password <b>Password123!</b>
                    </div>
                  </Alert>
                </form>
              )
            )}
          </div>
        </Box>
      </Box>
    </>
  );
};

Page.getLayout = (page) => (
  <AuthLayout>
    {page}
  </AuthLayout>
);

export default Page;
